import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import staticPlugin from '@fastify/static';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { FastifyInstance } from 'fastify';
import { config } from '../config/index.js';
import { db, pool } from '../db/index.js';
import { PhoneRepository } from '../repositories/phone.repository.js';
import { AiService } from '../services/ai.service.js';
import { PhoneService } from '../modules/phones/phone.service.js';
import { RecommendationService } from '../modules/recommendations/recommendation.service.js';
import { ComparisonService } from '../modules/comparisons/comparison.service.js';
import { SearchService } from '../modules/search/search.service.js';
import { registerAllTools } from '../tools/index.js';
import {
  PaginationQuerySchema,
  PhoneIdParamSchema,
  SearchQuerySchema,
} from '../schemas/phone.schema.js';
import { CompareInputSchema, PhoneDetailsInputSchema, RecommendInputSchema } from '../schemas/recommendation.schema.js';
import { NotFoundError } from '../types/index.js';

interface McpSession {
  server: McpServer;
  transport: StreamableHTTPServerTransport;
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      ...(config.NODE_ENV === 'development'
        ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
        : {}),
    },
  });

  // ── Composition root ──────────────────────────────────────────────────────
  const repo = new PhoneRepository(db);
  const aiService = new AiService(app.log);
  const phoneService = new PhoneService(repo);
  const recommendationService = new RecommendationService(repo, aiService);
  const comparisonService = new ComparisonService(repo);
  const searchService = new SearchService(repo);

  const toolDeps = { recommendationService, comparisonService, phoneService, searchService };

  // ── Rate limiting ─────────────────────────────────────────────────────────
  await app.register(rateLimit, {
    max: 60,
    timeWindow: '1 minute',
    errorResponseBuilder: () => ({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please wait before sending more requests.',
      statusCode: 429,
    }),
  });

  // ── CORS ──────────────────────────────────────────────────────────────────
  await app.register(cors, {
    origin: config.NODE_ENV === 'production' ? false : true,
    hook: 'preHandler',
  });

  // ── Static frontend ───────────────────────────────────────────────────────
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const publicDir = path.join(__dirname, '..', '..', 'public');
  await app.register(staticPlugin, {
    root: publicDir,
    prefix: '/ui',
  });

  // ── REST routes ───────────────────────────────────────────────────────────

  app.get('/', async (_req, reply) => {
    return reply.sendFile('index.html', publicDir);
  });

  app.get('/health', async (_req, reply) => {
    try {
      await pool.query('SELECT 1');
      return reply.send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        aiProvider: aiService.provider,
        db: 'connected',
      });
    } catch {
      return reply.status(503).send({
        status: 'error',
        db: 'disconnected',
      });
    }
  });

  app.get('/phones', async (request, reply) => {
    const query = PaginationQuerySchema.safeParse(request.query);
    if (!query.success) {
      return reply.status(400).send({ error: 'Invalid query parameters', details: query.error.flatten() });
    }
    const { page, limit } = query.data;
    const result = await phoneService.getAll(page, limit);
    return { ...result, page, limit };
  });

  app.get('/phones/:id', async (request, reply) => {
    const params = PhoneIdParamSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({ error: 'Invalid phone ID' });
    }
    try {
      const phone = await phoneService.getById(params.data.id);
      return phone;
    } catch (err) {
      if (err instanceof NotFoundError) return reply.status(404).send({ error: err.message });
      throw err;
    }
  });

  app.post('/recommend', async (request, reply) => {
    const body = RecommendInputSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request', details: body.error.flatten() });
    }
    try {
      const results = await recommendationService.recommend(body.data.query);
      return { query: body.data.query, recommendations: results };
    } catch (err) {
      app.log.error({ err }, 'Recommendation failed');
      return reply.status(500).send({ error: 'Recommendation service unavailable' });
    }
  });

  app.post('/compare', async (request, reply) => {
    const body = CompareInputSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request', details: body.error.flatten() });
    }
    try {
      const result = await comparisonService.compare(body.data.phones);
      return result;
    } catch (err) {
      if (err instanceof NotFoundError) return reply.status(404).send({ error: err.message });
      throw err;
    }
  });

  app.get('/phones/search', async (request, reply) => {
    const query = SearchQuerySchema.safeParse(request.query);
    if (!query.success) {
      return reply.status(400).send({ error: 'Invalid query parameters', details: query.error.flatten() });
    }
    const results = await searchService.search(query.data);
    return { count: results.length, phones: results };
  });

  app.post('/phone-details', async (request, reply) => {
    const body = PhoneDetailsInputSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request', details: body.error.flatten() });
    }
    try {
      const phone = await phoneService.getByName(body.data.phone);
      return {
        name: `${phone.brand} ${phone.model}`,
        brand: phone.brand,
        model: phone.model,
        releaseYear: phone.releaseYear,
        price: `$${phone.priceUsd}`,
        operatingSystem: phone.operatingSystem,
        specifications: {
          chipset: phone.chipset,
          ram: `${phone.ram}GB`,
          storage: `${phone.storage}GB`,
          battery: { capacity: `${phone.batteryMah}mAh`, charging: `${phone.chargingWatt}W` },
          display: {
            size: `${phone.displaySize}"`,
            type: phone.displayType,
            refreshRate: `${phone.refreshRate}Hz`,
          },
          waterproofRating: phone.waterproofRating ?? 'None',
          eSIM: phone.esimSupport,
        },
        scores: phone.scores,
      };
    } catch (err) {
      if (err instanceof NotFoundError) return reply.status(404).send({ error: err.message });
      throw err;
    }
  });

  // ── MCP routes ────────────────────────────────────────────────────────────
  const sessions = new Map<string, McpSession>();

  app.post('/mcp', async (request, reply) => {
    reply.hijack();
    try {
      const sessionId =
        (request.headers['mcp-session-id'] as string | undefined) ?? randomUUID();
      let session = sessions.get(sessionId);
      if (!session) {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => sessionId,
        });
        const mcpServer = new McpServer({ name: 'PhoneMatch', version: '1.0.0' });
        registerAllTools(mcpServer, toolDeps);
        await mcpServer.connect(transport);
        transport.onclose = () => sessions.delete(sessionId);
        session = { server: mcpServer, transport };
        sessions.set(sessionId, session);
        app.log.info({ sessionId }, 'MCP session created');
      }
      await session.transport.handleRequest(request.raw, reply.raw, request.body);
    } catch (err) {
      app.log.error(err, 'MCP POST error');
      if (!reply.raw.headersSent) {
        reply.raw.writeHead(500, { 'Content-Type': 'application/json' });
        reply.raw.end(JSON.stringify({ error: 'Internal server error' }));
      }
    }
  });

  app.get('/mcp', async (request, reply) => {
    reply.hijack();
    try {
      const sessionId = request.headers['mcp-session-id'] as string | undefined;
      if (!sessionId) {
        reply.raw.writeHead(400, { 'Content-Type': 'application/json' });
        reply.raw.end(JSON.stringify({ error: 'mcp-session-id header required' }));
        return;
      }
      const session = sessions.get(sessionId);
      if (!session) {
        reply.raw.writeHead(404, { 'Content-Type': 'application/json' });
        reply.raw.end(JSON.stringify({ error: 'Session not found' }));
        return;
      }
      await session.transport.handleRequest(request.raw, reply.raw);
    } catch (err) {
      app.log.error(err, 'MCP GET error');
      if (!reply.raw.headersSent) {
        reply.raw.writeHead(500, { 'Content-Type': 'application/json' });
        reply.raw.end(JSON.stringify({ error: 'Internal server error' }));
      }
    }
  });

  app.delete('/mcp', async (request, reply) => {
    const sessionId = request.headers['mcp-session-id'] as string | undefined;
    if (sessionId) {
      const session = sessions.get(sessionId);
      if (session) {
        try { await session.transport.close(); } catch { /* ignore */ }
        sessions.delete(sessionId);
        app.log.info({ sessionId }, 'MCP session deleted');
      }
    }
    return reply.status(204).send();
  });

  return app;
}

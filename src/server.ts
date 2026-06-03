import { buildApp } from './app/index.js';
import { config } from './config/index.js';
import { closeDb, pool } from './db/index.js';

const app = await buildApp();

// Verify DB is reachable before accepting traffic
try {
  await pool.query('SELECT 1');
  app.log.info('Database connection verified');
} catch (err) {
  app.log.error({ err }, 'Cannot connect to database — aborting startup');
  process.exit(1);
}

async function gracefulShutdown(signal: string): Promise<void> {
  app.log.info({ signal }, 'Shutting down gracefully...');
  try {
    await app.close();
    await closeDb();
    process.exit(0);
  } catch (err) {
    app.log.error(err, 'Error during shutdown');
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

try {
  await app.listen({ port: config.PORT, host: '0.0.0.0' });
  app.log.info(`PhoneMatch MCP server running on port ${config.PORT}`);
  app.log.info(`MCP endpoint: http://0.0.0.0:${config.PORT}/mcp`);
} catch (err) {
  app.log.error(err, 'Failed to start server');
  process.exit(1);
}

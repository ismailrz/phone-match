# PhoneMatch MCP

AI-powered smartphone recommendation server exposing both MCP tools (for Claude Desktop and other AI assistants) and a REST API.

## Features

- **Natural language recommendations** — "best camera phone under $800"
- **Side-by-side comparisons** — "compare iPhone 17 Pro vs Galaxy S25 Ultra"
- **Full specs lookup** — "show me Pixel 9 Pro details"
- **Filtered search** — by brand, price, OS, RAM, storage
- **Deterministic ranking** — data-driven scoring, not LLM-ranked
- **103 phones** across 14 brands in the database
- **MCP + REST** — works with Claude Desktop and as a standard HTTP API

---

## Quick Start (Docker)

```bash
# 1. Copy env and set your Anthropic API key (optional — keyword fallback works without it)
cp .env.example .env

# 2. Start PostgreSQL
docker compose up postgres -d

# 3. Run migrations and seed data
docker compose run --rm migrate

# 4. Start the app
docker compose up app -d

# 5. Check it's running
curl http://localhost:3000/health
```

---

## Manual Local Setup

### Prerequisites
- Node.js 22+
- PostgreSQL 14+

### Steps

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set DATABASE_URL (and optionally ANTHROPIC_API_KEY)

# Push schema to database
npm run db:push

# Seed with 103 phones
npm run db:seed

# Start development server
npm run dev
```

The server starts at `http://localhost:3000`.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `PORT` | No | `3000` | HTTP port |
| `ANTHROPIC_API_KEY` | No | — | Claude API key for smarter extraction |
| `NODE_ENV` | No | `development` | Environment mode |
| `LOG_LEVEL` | No | `info` | Pino log level |

Without `ANTHROPIC_API_KEY`, the server falls back to keyword-based requirement extraction (still works well for common queries).

---

## REST API

### `GET /health`
```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"2025-05-31T...","version":"1.0.0"}
```

### `GET /phones`
```bash
curl "http://localhost:3000/phones?page=1&limit=10"
```

### `GET /phones/:id`
```bash
curl http://localhost:3000/phones/1
```

### `GET /phones/search`
```bash
curl "http://localhost:3000/phones/search?brand=Samsung&maxPrice=800&os=Android"
```

### `POST /recommend`
```bash
curl -X POST http://localhost:3000/recommend \
  -H "Content-Type: application/json" \
  -d '{"query": "best camera phone under $800"}'
```

### `POST /compare`
```bash
curl -X POST http://localhost:3000/compare \
  -H "Content-Type: application/json" \
  -d '{"phones": ["iPhone 17 Pro Max", "Galaxy S25 Ultra"]}'
```

---

## MCP Tools

### Claude Desktop Integration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "phonematch": {
      "url": "http://localhost:3000/mcp",
      "transport": "http"
    }
  }
}
```

Restart Claude Desktop and you can now ask:
- *"What's the best gaming phone under $700?"*
- *"Compare the iPhone 17 Pro and Galaxy S25"*
- *"Find me a phone for my parents with a large screen"*
- *"Show me all Samsung phones under $500"*

### Available MCP Tools

#### `recommend_phone`
Find smartphones matching natural language requirements.
```json
{ "query": "I travel a lot and need amazing photos and long battery life" }
```

#### `compare_phones`
Side-by-side comparison of 2–5 phones.
```json
{ "phones": ["iPhone 17 Pro Max", "Samsung Galaxy S25 Ultra", "Google Pixel 9 Pro"] }
```

#### `phone_details`
Full specifications for a specific phone.
```json
{ "phone": "Pixel 9 Pro" }
```

#### `search_phone`
Filter phones by brand, price, OS, RAM, storage.
```json
{
  "brand": "Samsung",
  "maxPrice": 800,
  "os": "Android",
  "minRam": 8
}
```

---

## Recommendation Engine

Ranking is **fully deterministic** — no LLM in the scoring loop.

1. Claude API (or keyword fallback) parses the query into weights:
   ```json
   { "camera": 50, "battery": 30, "value": 20 }
   ```

2. Each phone is scored:
   ```
   finalScore = Σ(scoreCategory × weight) / Σ(weights)
   ```

3. Phones are ranked by `finalScore`, top 5 returned.

Score dimensions (0–100 each):
| Dimension | What it measures |
|---|---|
| `camera` | Camera system quality |
| `battery` | Battery life & capacity |
| `gaming` | Gaming performance & thermals |
| `performance` | Overall chipset speed |
| `display` | Screen quality & refresh rate |
| `durability` | IP rating & build quality |
| `value` | Value for money |

---

## Running Tests

```bash
# Run all tests
npm test

# With coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

Tests cover:
- Scoring algorithm (unit tests, edge cases)
- Recommendation service (mock repository/AI)
- Search service
- Comparison service

---

## Development

```bash
# Type check
npm run build

# Lint
npm run lint

# Format
npm run format

# Generate Drizzle migration after schema changes
npm run db:generate

# Apply migrations
npm run db:migrate
```

---

## Project Structure

```
src/
├── config/          # Zod-validated environment config
├── db/              # Drizzle schema, connection, seed data
├── repositories/    # Database queries (only SQL layer)
├── services/        # AI service (Claude API + keyword fallback)
├── modules/
│   ├── phones/      # Phone lookup service
│   ├── recommendations/  # Core ranking engine
│   ├── comparisons/ # Side-by-side comparison
│   └── search/      # Filtered search
├── tools/           # MCP tool registrations
├── schemas/         # Zod validation schemas
├── types/           # Shared TypeScript types
├── utils/           # Scoring algorithm, helpers
├── prompts/         # AI extraction prompt + response schema
├── app/             # Fastify app factory (composition root)
└── server.ts        # Entry point
```

---

## Supported Brands (103 phones)

Apple · Samsung · Google · OnePlus · Xiaomi · Nothing · Motorola · OPPO · Vivo · Sony · ASUS · Realme · Tecno · iQOO

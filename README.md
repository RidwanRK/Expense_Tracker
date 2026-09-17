# Expense Tracker

A responsive personal expense tracker built with Next.js (App Router, TypeScript, Tailwind CSS) and MongoDB, with two interfaces onto the same data:

- **Web UI** (`/`) — a mobile-first dashboard for logging expenses and viewing monthly breakdowns.
- **MCP endpoint** (`/api/mcp`) — a Model Context Protocol server over Streamable HTTP so AI agents (Claude Desktop, Cursor, custom agents) can log and analyze expenses via tool calls.

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS v4, lucide-react
- MongoDB (native `mongodb` driver, pooled connection for serverless)
- `@modelcontextprotocol/sdk` — `McpServer` + `WebStandardStreamableHTTPServerTransport`
- Zod schemas shared between the REST API and MCP tool definitions (`lib/schemas.ts`)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the template and fill in your MongoDB connection string:

```bash
cp .env.local.example .env.local
```

```ini
# .env.local
MONGODB_URI=mongodb://localhost:27017        # or an Atlas SRV URI
MONGODB_DB=expense_tracker
MCP_AUTH_TOKEN=                              # optional bearer token to protect /api/mcp
```

For local development without Atlas, you can run MongoDB in Docker:

```bash
docker run -d --name expense-tracker-mongo -p 27017:27017 mongo:7
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the dashboard.

### 4. Build for production

```bash
npm run build
npm run start
```

## Project structure

```
app/
  page.tsx                 # Server component: fetches initial month's data, renders Dashboard
  layout.tsx
  globals.css
  api/
    expenses/route.ts      # REST API (GET/POST) for the web UI
    mcp/route.ts            # MCP Streamable HTTP endpoint
components/dashboard/       # Dashboard UI (summary card, breakdown, forms, nav)
lib/
  mongodb.ts                # Cached MongoDB connection helper
  expenses.ts                # Data-access functions shared by REST API and MCP tools
  schemas.ts                  # Zod validation schemas shared by both interfaces
  mcp-server.ts                # MCP server + tool registration
  types.ts                      # Shared TypeScript types
```

## REST API

`GET /api/expenses?month=YYYY-MM&category=&keyword=&limit=`
Returns `{ transactions: Transaction[], summary: MonthlySummary | null }`. `summary` is populated only when `month` is provided.

`POST /api/expenses`
Body: `{ amount: number, category: string, description: string, txDate?: "YYYY-MM-DD" }` → `201 { transaction: Transaction }`.

## MCP tools

Exposed at `POST/GET/DELETE /api/mcp` (Streamable HTTP, stateless — a new server instance is created per request, so it works behind any serverless/load-balanced deployment):

| Tool | Parameters | Description |
|---|---|---|
| `log_expense` | `amount`, `category`, `description`, `txDate?` | Inserts a transaction |
| `get_monthly_summary` | `yearMonth` (`"YYYY-MM"`) | Total spend, count, category breakdown with percentages |
| `search_expenses` | `keyword?`, `category?`, `limit?` | Recent matching transactions |

### Connecting an AI client

#### Claude Desktop

Claude Desktop connects to remote MCP servers as a "custom connector" (Settings → Connectors → Add custom connector), or via `claude_desktop_config.json` using the `mcp-remote` bridge (Desktop's native config only spawns local stdio servers, so a remote HTTP/SSE server needs this bridge):

```json
{
  "mcpServers": {
    "expense-tracker": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://your-deployed-app.example.com/api/mcp"
      ]
    }
  }
}
```

If `MCP_AUTH_TOKEN` is set, pass it as a header:

```json
{
  "mcpServers": {
    "expense-tracker": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://your-deployed-app.example.com/api/mcp",
        "--header",
        "Authorization: Bearer ${MCP_AUTH_TOKEN}"
      ],
      "env": {
        "MCP_AUTH_TOKEN": "your-shared-secret"
      }
    }
  }
}
```

Config file locations:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

Restart Claude Desktop after editing the file; the three tools will appear under the "expense-tracker" connector.

#### Cursor / other MCP-compatible clients

Most clients that support remote Streamable HTTP servers directly can point straight at the URL, no bridge needed:

```json
{
  "mcpServers": {
    "expense-tracker": {
      "url": "https://your-deployed-app.example.com/api/mcp",
      "headers": {
        "Authorization": "Bearer your-shared-secret"
      }
    }
  }
}
```

Omit the `headers` block if `MCP_AUTH_TOKEN` is unset.

### Testing the MCP endpoint with curl

```bash
curl -s http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Data model

`transactions` collection:

```ts
{
  _id: ObjectId,
  amount: number,       // positive float
  category: "Groceries" | "Transport" | "Dining" | "Bills" | "Shopping" | "Health" | "Other",
  description: string,
  txDate: string,        // "YYYY-MM-DD"
  createdAt: Date,
}
```

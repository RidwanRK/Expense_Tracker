import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createMcpServer } from "@/lib/mcp-server";

// The MongoDB driver needs the Node.js runtime (not Edge), and this endpoint
// must never be statically cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Optional shared-secret auth: if MCP_AUTH_TOKEN is set, callers must send
 * `Authorization: Bearer <token>`. Leave the env var unset for local dev.
 */
function isAuthorized(request: Request): boolean {
  const token = process.env.MCP_AUTH_TOKEN;
  if (!token) return true;
  return request.headers.get("authorization") === `Bearer ${token}`;
}

function unauthorized(): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "content-type": "application/json", "WWW-Authenticate": "Bearer" },
  });
}

/**
 * Handles every MCP request (initialize, tools/list, tools/call, ...) sent
 * over Streamable HTTP. A fresh McpServer + transport pair is created per
 * request in stateless mode (`sessionIdGenerator: undefined`), which keeps
 * this endpoint compatible with serverless deployments where consecutive
 * requests from the same client may land on different instances.
 */
async function handleMcpRequest(request: Request): Promise<Response> {
  if (!isAuthorized(request)) {
    return unauthorized();
  }

  const server = createMcpServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await server.connect(transport);
  return transport.handleRequest(request);
}

export { handleMcpRequest as GET, handleMcpRequest as POST, handleMcpRequest as DELETE };

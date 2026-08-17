const http = require('node:http');
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const registerTools = require('./registerTools');

if (!process.env.CORESALES_API_KEY) {
  console.error('CORESALES_API_KEY is not set. Create one via POST /api/admin/api-keys (or the admin UI) using an admin login, then set CORESALES_API_KEY before starting this service.');
  process.exit(1);
}

const PORT = process.env.PORT || 3100;

const server = new McpServer({ name: 'coresales-crm', version: '1.0.0' });
registerTools(server);

// Stateless mode: no session tracking needed since every tool call is an independent, authenticated
// REST call to the backend — there is no per-connection state to preserve between requests.
const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
server.connect(transport);

const httpServer = http.createServer(async (req, res) => {
  if (req.url !== '/mcp') {
    res.writeHead(404).end();
    return;
  }

  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', async () => {
    let parsedBody;
    try {
      parsedBody = body ? JSON.parse(body) : undefined;
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      return;
    }

    await transport.handleRequest(req, res, parsedBody);
  });
});

httpServer.listen(PORT, () => {
  console.log(`CoreSales MCP server listening on :${PORT}`);
});

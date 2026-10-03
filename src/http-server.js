#!/usr/bin/env node
import { createServer } from "http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer, loadProfile } from "./create-server.js";
import { renderLandingPage } from "./landing-page.js";

const PORT = process.env.PORT || 3000;

const httpServer = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    const profile = await loadProfile();
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderLandingPage(profile));
    return;
  }

  if (req.url !== "/mcp") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  // Modo stateless: um server/transport novo por requisição.
  const mcpServer = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  res.on("close", () => {
    transport.close();
    mcpServer.close();
  });

  await mcpServer.connect(transport);
  await transport.handleRequest(req, res);
});

httpServer.listen(PORT, () => {
  console.log(`mcp-perfil (HTTP) ouvindo na porta ${PORT}`);
});

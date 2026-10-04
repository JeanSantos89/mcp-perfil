#!/usr/bin/env node
import { createServer } from "http";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join, extname, resolve, sep } from "path";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer, loadProfile, listGithubRepos } from "./create-server.js";
import { renderLandingPage } from "./landing-page.js";
import { streamResumePdf, resumeFilename } from "./resume.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public");
const PORT = process.env.PORT || 3000;

const MIME = { ".mp4": "video/mp4", ".webm": "video/webm", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg" };

async function servePublicFile(req, res, filename) {
  const filePath = resolve(PUBLIC_DIR, filename);
  // Reject anything that escapes the public dir (e.g. "../../src/server.js")
  // before it ever touches the filesystem.
  if (filePath !== PUBLIC_DIR && !filePath.startsWith(PUBLIC_DIR + sep)) {
    res.writeHead(400);
    res.end("Bad request");
    return true;
  }
  let fileStat;
  try {
    fileStat = await stat(filePath);
  } catch {
    return false;
  }
  const contentType = MIME[extname(filePath)] || "application/octet-stream";
  const size = fileStat.size;
  const range = req.headers.range;

  const pipe = (stream) => {
    stream.on("error", () => res.destroy());
    stream.pipe(res);
  };

  const match = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (match) {
    const [, startStr, endStr] = match;
    let start;
    let end;
    if (startStr === "") {
      // Suffix form: "bytes=-500" means the last 500 bytes.
      const suffix = parseInt(endStr, 10);
      if (!Number.isFinite(suffix) || suffix <= 0) return serveWhole();
      start = Math.max(0, size - suffix);
      end = size - 1;
    } else {
      start = parseInt(startStr, 10);
      end = endStr === "" ? size - 1 : parseInt(endStr, 10);
    }

    // A stale client (e.g. holding a cache entry for a larger file) can ask
    // for bytes past the end. Reject those instead of crashing the stream.
    if (!Number.isFinite(start) || start >= size || start < 0) {
      res.writeHead(416, { "Content-Range": `bytes */${size}` });
      res.end();
      return true;
    }
    end = Math.min(Number.isFinite(end) ? end : size - 1, size - 1);
    if (end < start) end = size - 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": contentType,
    });
    pipe(createReadStream(filePath, { start, end }));
    return true;
  }

  return serveWhole();

  function serveWhole() {
    res.writeHead(200, { "Content-Length": size, "Content-Type": contentType, "Accept-Ranges": "bytes" });
    pipe(createReadStream(filePath));
    return true;
  }
}

const httpServer = createServer(async (req, res) => {
  try {
    await handleRequest(req, res);
  } catch (err) {
    console.error("Erro ao tratar requisição:", err);
    if (!res.headersSent) res.writeHead(500);
    res.end();
  }
});

async function handleRequest(req, res) {
  if (req.method === "GET" && req.url === "/health") {
    // Tiny response on purpose: this exists for uptime pingers / keep-alive
    // crons, which can choke or reject runs if the body is too large (the
    // full landing page is well over 100KB).
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("ok");
    return;
  }

  if (req.method === "GET" && req.url === "/") {
    const profile = await loadProfile();
    // Live GitHub facts are a nice-to-have: if the API is down or rate
    // limited, the page still renders from profile.json alone.
    let repos = null;
    try {
      repos = await listGithubRepos(profile.github_usuario);
    } catch (err) {
      console.warn("GitHub indisponível, servindo página sem dados ao vivo:", err.message);
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderLandingPage(profile, repos));
    return;
  }

  if (req.method === "GET" && req.url.startsWith("/resume")) {
    const profile = await loadProfile();
    const lang = new URL(req.url, "http://localhost").searchParams.get("lang") === "en" ? "en" : "pt";
    const filename = resumeFilename(profile, lang);
    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}.pdf"`,
    });
    streamResumePdf(profile, res, lang);
    return;
  }

  if (req.method === "GET" && (req.url.startsWith("/portrait") || req.url.startsWith("/favicon"))) {
    const served = await servePublicFile(req, res, req.url.slice(1).split("?")[0]);
    if (served) return;
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
}

export { httpServer };

// Only bind a port when this file is run directly (`node src/http-server.js`
// or `npm run start:http`). Tests import `httpServer` and listen on an
// ephemeral port themselves, so this must not fire on import.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  httpServer.listen(PORT, () => {
    console.log(`mcp-perfil (HTTP) ouvindo na porta ${PORT}`);
  });
}

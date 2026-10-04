// End-to-end tests against the real HTTP server (ephemeral port), covering
// the routes a browser/scraper actually hits and the path-traversal fix.
import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { httpServer } from "../src/http-server.js";

/** fetch()/WHATWG URL normalise ".." out of a path before it ever reaches
 *  the server, which would make the traversal test pass even without the
 *  fix. http.request() sends the path byte-for-byte, the way a real
 *  scanner (or curl --path-as-is) would, so it actually exercises the
 *  vulnerable code path. */
function rawRequest(base, rawPath) {
  const { port } = new URL(base);
  return new Promise((resolve, reject) => {
    const req = http.request({ host: "localhost", port, path: rawPath, method: "GET" }, (res) => {
      res.resume();
      res.on("end", () => resolve(res));
    });
    req.on("error", reject);
    req.end();
  });
}

async function withServer(fn) {
  await new Promise((resolve) => httpServer.listen(0, resolve));
  const { port } = httpServer.address();
  try {
    await fn(`http://localhost:${port}`);
  } finally {
    await new Promise((resolve) => httpServer.close(resolve));
  }
}

test("GET /health returns a tiny 200 for keep-alive pingers", async () => {
  await withServer(async (base) => {
    const res = await fetch(base + "/health");
    assert.equal(res.status, 200);
    const body = await res.text();
    // Pingers like cron-job.org reject oversized responses, which is exactly
    // why this route exists instead of pointing a keep-alive at "/".
    assert.ok(body.length < 100, `expected a tiny body, got ${body.length} bytes`);
  });
});

test("GET / serves the rendered landing page", async () => {
  await withServer(async (base) => {
    const res = await fetch(base + "/");
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type"), /text\/html/);
    const body = await res.text();
    assert.match(body, /<html/);
  });
});

test("GET /favicon.jpg and /portrait.mp4 are served from public/", async () => {
  await withServer(async (base) => {
    const favicon = await fetch(base + "/favicon.jpg");
    assert.equal(favicon.status, 200);
    const portrait = await fetch(base + "/portrait.mp4");
    assert.equal(portrait.status, 200);
  });
});

test("GET /resume downloads a PDF with language-aware filename", async () => {
  await withServer(async (base) => {
    const pt = await fetch(base + "/resume");
    assert.equal(pt.status, 200);
    assert.equal(pt.headers.get("content-type"), "application/pdf");
    assert.match(pt.headers.get("content-disposition"), /Curriculo\.pdf/);

    const en = await fetch(base + "/resume?lang=en");
    assert.match(en.headers.get("content-disposition"), /Resume\.pdf/);
  });
});

test("path traversal outside public/ is rejected, not served", async () => {
  await withServer(async (base) => {
    const res = await rawRequest(base, "/portrait/../../package.json");
    assert.notEqual(res.statusCode, 200);
    const res2 = await rawRequest(base, "/favicon/../../src/http-server.js");
    assert.notEqual(res2.statusCode, 200);
  });
});

test("unknown routes 404 instead of falling through to the MCP handler", async () => {
  await withServer(async (base) => {
    const res = await fetch(base + "/this-route-does-not-exist");
    assert.equal(res.status, 404);
  });
});

test("GET /mcp is reachable (Streamable HTTP endpoint)", async () => {
  await withServer(async (base) => {
    const res = await fetch(base + "/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} }),
    });
    // Any non-5xx response means the MCP transport wired up correctly;
    // the protocol handshake details aren't this test's concern.
    assert.ok(res.status < 500, `MCP endpoint errored with ${res.status}`);
  });
});

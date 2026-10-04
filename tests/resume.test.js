// The resume is generated live from profile.json on every request (no
// pre-rendered file to go stale). These tests catch the two failure modes
// that actually happened during development: a broken PDF from pdfkit
// cursor bugs, and language mixing up PT/EN.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PassThrough } from "node:stream";
import { streamResumePdf, resumeFilename } from "../src/resume.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadProfile() {
  const raw = await readFile(join(__dirname, "..", "profile.json"), "utf-8");
  return JSON.parse(raw);
}

function collect(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (c) => chunks.push(c));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

for (const lang of ["pt", "en"]) {
  test(`generates a valid, non-trivial PDF in ${lang}`, async () => {
    const profile = await loadProfile();
    const sink = new PassThrough();
    const done = collect(sink);
    streamResumePdf(profile, sink, lang);
    const buf = await done;
    assert.ok(buf.subarray(0, 5).toString("ascii") === "%PDF-", "not a PDF");
    // A resume covering the real profile data should run several KB, not a
    // near-empty document from a rendering crash swallowed mid-stream.
    assert.ok(buf.length > 3000, `PDF suspiciously small (${buf.length} bytes)`);
  });
}

test("PT filename uses 'Curriculo', EN filename uses 'Resume'", async () => {
  const profile = await loadProfile();
  const nome = profile.nome_exibicao || profile.nome;
  assert.equal(resumeFilename(profile, "pt"), `${nome} - Curriculo`);
  assert.equal(resumeFilename(profile, "en"), `${nome} - Resume`);
});

test("resume filename strips filesystem-unsafe characters", () => {
  const filename = resumeFilename({ nome_exibicao: 'Weird: Name / "Quotes"' }, "en");
  assert.ok(!/[\\/:*?"<>|]/.test(filename));
});

test("streamResumePdf never throws for the live profile data, in either language", async () => {
  const profile = await loadProfile();
  for (const lang of ["pt", "en"]) {
    const sink = new PassThrough();
    const done = collect(sink);
    assert.doesNotThrow(() => streamResumePdf(profile, sink, lang));
    await done;
  }
});

// Structural tests for the rendered landing page. These assert counts and
// invariants derived FROM profile.json rather than hardcoded copy, so the
// page can keep changing content without breaking the suite — only the
// shape (one card per project, one entry per job, etc.) is pinned.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { renderLandingPage } from "../src/landing-page.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadProfile() {
  const raw = await readFile(join(__dirname, "..", "profile.json"), "utf-8");
  return JSON.parse(raw);
}

test("renders one project card per project in profile.json", async () => {
  const profile = await loadProfile();
  const html = renderLandingPage(profile, null);
  const cardMatches = html.match(/class="proj-card reveal"/g) || [];
  assert.equal(cardMatches.length, profile.projetos.length);
});

test("renders one timeline entry per experience in profile.json", async () => {
  const profile = await loadProfile();
  const html = renderLandingPage(profile, null);
  const entryMatches = html.match(/class="checkpoint reveal"/g) || [];
  assert.equal(entryMatches.length, profile.experiencias.length);
});

test("every skill category with items renders its own cell", async () => {
  const profile = await loadProfile();
  const html = renderLandingPage(profile, null);
  const populated = Object.values(profile.habilidades).filter((v) => v?.length);
  const cellMatches = html.match(/class="skill-cell reveal"/g) || [];
  assert.equal(cellMatches.length, populated.length);
});

test("every project link and experience company name is escaped into the page", async () => {
  const profile = await loadProfile();
  const html = renderLandingPage(profile, null);
  for (const proj of profile.projetos) {
    assert.ok(html.includes(proj.link), `missing link for project ${proj.nome}`);
  }
  for (const exp of profile.experiencias) {
    assert.ok(html.includes(exp.empresa), `missing company name ${exp.empresa}`);
  }
});

test("renders without live GitHub data (offline / rate-limited fallback)", async () => {
  const profile = await loadProfile();
  assert.doesNotThrow(() => renderLandingPage(profile, null));
});

test("raw HTML/script in profile data never reaches the page unescaped (XSS guard)", async () => {
  const profile = await loadProfile();
  const poisoned = {
    ...profile,
    nome_exibicao: '<script>alert(1)</script>',
  };
  const html = renderLandingPage(poisoned, null);
  assert.ok(!html.includes("<script>alert(1)</script>"));
  assert.ok(html.includes("&lt;script&gt;"));
});

test("resume and email links are present in the hero", async () => {
  const profile = await loadProfile();
  const html = renderLandingPage(profile, null);
  assert.ok(html.includes('href="/resume?lang=en"'));
  assert.ok(html.includes('href="mailto:jeansaantos89@gmail.com"'));
});

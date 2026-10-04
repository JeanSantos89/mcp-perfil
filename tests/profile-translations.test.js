// This is the test that matters most for "feed new data and the site just
// adapts": every free-text field pulled from profile.json must have an EN
// translation registered in src/i18n.js, or the landing page and the resume
// silently fall back to Portuguese in English mode (this bit us for real —
// mcp-perfil's own project card, plus 4 others, shipped untranslated).
//
// Whenever profile.json grows a new experience, project, course or cert,
// this test fails until the matching dictionary entry is added to i18n.js.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { en } from "../src/i18n.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadProfile() {
  const raw = await readFile(join(__dirname, "..", "profile.json"), "utf-8");
  return JSON.parse(raw);
}

function highlights(desc = "") {
  return desc
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2));
}

// A handful of role titles are already identical in PT and EN on purpose
// (e.g. a freelance platform role name used verbatim in both). Translation
// coverage for those is still registered in i18n.js — en(x) just happens to
// equal x — so inequality alone isn't the right check for them.
const INTENTIONALLY_IDENTICAL = new Set([
  "Quality Assurance Tester (Freelance)",
]);

function assertTranslated(value, context) {
  if (INTENTIONALLY_IDENTICAL.has(value)) return;
  assert.notEqual(
    en(value),
    value,
    `missing EN translation for ${context}: "${value.slice(0, 80)}${value.length > 80 ? "…" : ""}"`
  );
}

test("every experience role, bullet and location has an EN translation", async () => {
  const profile = await loadProfile();
  assertTranslated(profile.titulo, "profile.titulo");
  assertTranslated(profile.localizacao, "profile.localizacao");
  assertTranslated(profile.resumo_curto, "profile.resumo_curto");

  for (const exp of profile.experiencias || []) {
    assertTranslated(exp.cargo, `experiencias[].cargo ("${exp.cargo}" @ ${exp.empresa})`);
    for (const bullet of highlights(exp.descricao)) {
      assertTranslated(bullet, `experiencias[].descricao bullet (${exp.empresa})`);
    }
  }
});

test("every project description has an EN translation", async () => {
  const profile = await loadProfile();
  for (const proj of profile.projetos || []) {
    assertTranslated(proj.descricao, `projetos[].descricao ("${proj.nome}")`);
  }
});

test("every course title in formacao has an EN translation", async () => {
  const profile = await loadProfile();
  for (const ed of profile.formacao || []) {
    assertTranslated(ed.curso, `formacao[].curso ("${ed.curso}")`);
  }
});

test("every recommendation has an EN translation", async () => {
  const profile = await loadProfile();
  for (const rec of profile.recomendacoes_recebidas || []) {
    const text = rec.texto || rec.recomendacao || rec.depoimento;
    if (text) assertTranslated(text, `recomendacoes_recebidas (${rec.autor || rec.nome || "?"})`);
  }
});

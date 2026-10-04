import { UI, SKILL_LABELS, SKILL_COPY, en } from "./i18n.js";

function esc(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function cm() {
  return "";
}

/** Bilingual attributes. The document renders in English, so the element's
 *  own text content is the English side and PT rides along in a data attr. */
function bi(pt, enText) {
  return `data-pt="${esc(pt)}" data-en="${esc(enText ?? en(pt))}"`;
}

/** Renders a text node that can be swapped by the language picker. */
function t(pt, enText) {
  const e = enText ?? en(pt);
  return `<span ${bi(pt, e)}>${esc(e)}</span>`;
}

/** UI dictionary entry -> [pt, en] */
function ui(key) {
  return UI[key] || [key, key];
}

function uiText(key) {
  const [pt, e] = ui(key);
  return t(pt, e);
}

function renderSkillCell(key, itens) {
  if (!itens?.length) return "";
  const [pt, e] = SKILL_LABELS[key] || [key, key];
  const copy = SKILL_COPY[key];
  // The full keyword list still ships in the agent view; here we say what
  // the capability is for instead of listing tool names.
  const body = copy
    ? `<p class="skill-copy" ${bi(copy[0], copy[1])}>${esc(copy[1])}</p>`
    : `<div class="chip-row">${itens.map((i) => `<span class="pui-chip pui-outline pui-surface">${esc(i)}</span>`).join("")}</div>`;
  return `
    <div class="skill-cell reveal">
      <h3 ${bi(pt, e)}>${esc(e)}</h3>
      ${body}
    </div>`;
}

/** Pulls the "- " highlights out of a profile description. */
function highlights(desc = "") {
  return desc
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2));
}

function renderExpEntry(exp) {
  const periodPt = `${exp.inicio} - ${exp.fim}`;
  const periodEn = `${en(exp.inicio)} - ${en(exp.fim)}`;
  const items = highlights(exp.descricao)
    .map((b) => `<li ${bi(b)}>${esc(en(b))}</li>`)
    .join("");
  return `
    <li class="checkpoint reveal">
      <span class="checkpoint-dot"></span>
      <div class="checkpoint-body">
        <div class="head-row">
          <h3 ${bi(exp.cargo)}>${esc(en(exp.cargo))}</h3>
          <span class="meta" ${bi(periodPt, periodEn)}>${esc(periodEn)}</span>
        </div>
        <p class="muted company">${esc(exp.empresa)}</p>
        ${items ? `<ul class="delivered">${items}</ul>` : ""}
      </div>
    </li>`;
}

/** Relative time, e.g. "3d ago" / "ha 3d". */
function ago(iso, lang) {
  const then = new Date(iso).getTime();
  if (!then) return null;
  const days = Math.floor((Date.now() - then) / 86400000);
  if (days <= 0) return lang === "pt" ? "hoje" : "today";
  if (days < 30) return lang === "pt" ? `ha ${days}d` : `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return lang === "pt" ? `ha ${months}m` : `${months}mo ago`;
  const years = Math.floor(months / 12);
  return lang === "pt" ? `ha ${years}a` : `${years}y ago`;
}

function renderProjCard(proj, live) {
  const repo = live?.get(proj.nome);
  const tech = (proj.tecnologias || []).join(", ");
  const catPt = proj.categoria || "";
  const catEn = en(catPt);
  const linePt = [catPt, tech].filter(Boolean).join(" · ");
  const lineEn = [catEn, tech].filter(Boolean).join(" · ");

  let live_ = "";
  if (repo) {
    const pt = [];
    const e = [];
    if (repo.linguagem_principal) { pt.push(repo.linguagem_principal); e.push(repo.linguagem_principal); }
    if (repo.estrelas > 0) { pt.push(`${repo.estrelas}★`); e.push(`${repo.estrelas}★`); }
    const aPt = ago(repo.atualizado_em, "pt");
    if (aPt) { pt.push(aPt); e.push(ago(repo.atualizado_em, "en")); }
    if (pt.length) live_ = `<span class="repo-meta" ${bi(pt.join(" · "), e.join(" · "))}>${esc(e.join(" · "))}</span>`;
  }

  const statusPt = proj.status || "pronto";
  const ready = statusPt === "pronto";
  return `
    <a class="proj-card reveal" href="${esc(proj.link)}" target="_blank" rel="noopener"
       data-status="${esc(statusPt)}" data-cat="${esc(catPt)}" data-tech="${esc((proj.tecnologias || []).join("|"))}">
      <div class="proj-head">
        <span class="proj-name">${esc(proj.nome)}</span>
        <span class="proj-status${ready ? "" : " wip"}" ${bi(statusPt)}>${esc(en(statusPt))}</span>
      </div>
      <p class="proj-meta" ${bi(linePt, lineEn)}>${esc(lineEn)}</p>
      <p class="proj-desc" ${bi(proj.descricao)}>${esc(en(proj.descricao))}</p>
      <div class="proj-foot">
        <span class="proj-link">GitHub</span>
        ${live_}
      </div>
    </a>`;
}

/** Project filters, in three bands: status, category, then the handful of
 *  technologies that group enough projects to be worth a filter. A chip that
 *  only ever matches one card is noise, not navigation. */
const TECH_FACET_MIN = 3;

function renderFacets(projetos) {
  const chip = (key, ptLabel, enLabel, count, active) =>
    `<button type="button" class="facet${active ? " is-active" : ""}" data-facet="${esc(key)}">` +
    `<span ${bi(ptLabel, enLabel)}>${esc(enLabel)}</span><span class="facet-n">${count}</span></button>`;

  const tally = (pick) => {
    const m = new Map();
    for (const p of projetos) for (const v of pick(p)) m.set(v, (m.get(v) || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  };

  const ready = projetos.filter((p) => (p.status || "pronto") === "pronto").length;
  const wip = projetos.length - ready;

  const bands = [];

  const status = [chip("all", ui("filterAll")[0], ui("filterAll")[1], projetos.length, true)];
  if (ready) status.push(chip("status:pronto", "pronto", "Ready", ready, false));
  if (wip) status.push(chip("status:em andamento", "em andamento", "In progress", wip, false));
  bands.push(status.join(""));

  const cats = tally((p) => (p.categoria ? [p.categoria] : []))
    .map(([c, n]) => chip("cat:" + c, c, en(c), n, false));
  if (cats.length) bands.push(cats.join(""));

  const techs = tally((p) => p.tecnologias || [])
    .filter(([, n]) => n >= TECH_FACET_MIN)
    .map(([t, n]) => chip("tech:" + t, t, t, n, false));
  if (techs.length) bands.push(techs.join(""));

  return bands.filter(Boolean).join('<span class="facet-sep" aria-hidden="true"></span>');
}

function renderProduct(pr) {
  return `
    <a class="product reveal" href="${esc(pr.link)}" target="_blank" rel="noopener">
      <h3 class="product-name">${esc(pr.nome)}</h3>
      <p class="product-lead" ${bi(pr.resumo)}>${esc(en(pr.resumo))}</p>
      <div class="product-figure">
        <span class="num" data-count="${pr.valor}">0</span>
        <span class="product-label" ${bi(pr.rotulo)}>${esc(en(pr.rotulo))}</span>
      </div>
      <p class="product-sub" ${bi(pr.secundario)}>${esc(en(pr.secundario))}</p>
    </a>`;
}

function renderRecCard(rec) {
  const ptQ = `"${rec.texto}"`;
  const enQ = `"${en(rec.texto)}"`;
  return `
    <blockquote class="pui-card reveal">
      <div class="pui-card-content">
        <p class="lead-sm" ${bi(ptQ, enQ)}>${esc(enQ)}</p>
        <footer>
          <strong>${esc(rec.autor)}</strong>
          <span class="muted" ${bi(rec.cargo_autor)}>${esc(en(rec.cargo_autor))}</span>
        </footer>
      </div>
    </blockquote>`;
}

/** Agent-mode copy for one section, in both languages. */
function agentBlock(ptLines, enLines) {
  const pt = ptLines.join("\n");
  const e = enLines.join("\n");
  return `<pre class="agent-text" ${bi(pt, e)}>${esc(e)}</pre>`;
}

function stat(value, key, suffix = "") {
  const [pt, e] = ui(key);
  // "%" belongs to the figure; a word like "min" reads as a muted unit.
  const tail = suffix === "%"
    ? `<span class="pct">%</span>`
    : suffix ? `<span class="muted">${esc(suffix)}</span>` : "";
  return `
    <div class="stat reveal">
      <span class="stat-value"><span class="num" data-count="${value}">0</span>${tail}</span>
      <span class="stat-label" ${bi(pt, e)}>${esc(e)}</span>
    </div>`;
}

export function renderLandingPage(profile, liveRepos = null) {
  // Map of repo name -> live GitHub facts, when the fetch succeeded.
  const live = liveRepos ? new Map(liveRepos.map((r) => [r.nome, r])) : null;

  const skillCells = Object.entries(profile.habilidades || {})
    .map(([key, itens]) => renderSkillCell(key, itens))
    .join("");

  const experiencias = profile.experiencias || [];
  const expEntries = experiencias.map(renderExpEntry).join("");
  const projetos = profile.projetos || [];
  const projCards = projetos.map((p) => renderProjCard(p, live)).join("");
  const projFacets = renderFacets(projetos);
  const produtos = profile.produtos || [];
  const productCards = produtos.map(renderProduct).join("");
  const productsAgentPt = ["products:", ...produtos.map((x) => `- ${x.nome}: ${x.valor} ${x.rotulo} (${x.secundario})`)];
  const productsAgentEn = ["products:", ...produtos.map((x) => `- ${x.nome}: ${x.valor} ${en(x.rotulo)} (${en(x.secundario)})`)];
  const recomendacoes = profile.recomendacoes_recebidas || [];
  const recCards = recomendacoes.map(renderRecCard).join("");

  const MCP_URL = "https://jean-santos.onrender.com/mcp";
  const MCP_CLIENTS = [
    { id: "claude", label: "claude code", cmd: `claude mcp add --transport http perfil ${MCP_URL}` },
    { id: "cursor", label: "cursor", cmd: `{ "mcpServers": { "perfil": { "url": "${MCP_URL}" } } }` },
    { id: "vscode", label: "vs code", cmd: `{ "servers": { "perfil": { "type": "http", "url": "${MCP_URL}" } } }` },
    { id: "curl", label: "curl", cmd: `curl -X POST ${MCP_URL} -H "Content-Type: application/json"` },
  ];
  const MCP_TOOLS = [
    "resumo_perfil",
    "buscar_experiencias",
    "listar_habilidades",
    "buscar_projetos",
    "listar_recomendacoes",
    "listar_repositorios_github",
    "buscar_repositorio_github",
  ];
  const nome = profile.nome_exibicao || profile.nome;

  const heroAgentPt = [
    `# ${nome}`,
    profile.titulo,
    `local: ${profile.localizacao}`,
    "atual: Cortex Geofusion · criador do QA-memory",
    "",
    profile.resumo_curto,
    "",
    `mcp: ${MCP_URL}`,
    `tools: ${MCP_TOOLS.join(", ")}`,
  ];
  const heroAgentEn = [
    `# ${nome}`,
    en(profile.titulo),
    `location: ${en(profile.localizacao)}`,
    "current: Cortex Geofusion · creator of QA-memory",
    "",
    en(profile.resumo_curto),
    "",
    `mcp: ${MCP_URL}`,
    `tools: ${MCP_TOOLS.join(", ")}`,
  ];

  const statRows = [
    [409, "statRules", ""],
    [98, "statRegression", "%"],
    [92, "statCoverage", "%"],
    [30, "statHeartbeat", "min"],
  ];
  const numbersAgentPt = ["metrics:", ...statRows.map(([v, k, sfx]) => `- ${v}${sfx} ${ui(k)[0]}`)];
  const numbersAgentEn = ["metrics:", ...statRows.map(([v, k, sfx]) => `- ${v}${sfx} ${ui(k)[1]}`)];

  const skillPairs = Object.entries(profile.habilidades || {});
  const skillsAgentPt = ["skills:", ...skillPairs.map(([k, v]) => `- ${(SKILL_LABELS[k] || [k])[0]}: ${(v || []).join(", ")}`)];
  const skillsAgentEn = ["skills:", ...skillPairs.map(([k, v]) => `- ${(SKILL_LABELS[k] || [k, k])[1]}: ${(v || []).join(", ")}`)];

  const expAgentPt = ["experience:"];
  const expAgentEn = ["experience:"];
  for (const e of experiencias) {
    expAgentPt.push(`- ${e.cargo} @ ${e.empresa} (${e.inicio}: ${e.fim})`);
    expAgentEn.push(`- ${en(e.cargo)} @ ${e.empresa} (${en(e.inicio)}: ${en(e.fim)})`);
    if (e.tecnologias?.length) {
      expAgentPt.push(`  stack: ${e.tecnologias.join(", ")}`);
      expAgentEn.push(`  stack: ${e.tecnologias.join(", ")}`);
    }
  }

  const projAgentPt = ["projects:"];
  const projAgentEn = ["projects:"];
  for (const pr of projetos) {
    projAgentPt.push(`- ${pr.nome}: ${pr.link}`, `  ${pr.descricao}`);
    projAgentEn.push(`- ${pr.nome}: ${pr.link}`, `  ${en(pr.descricao)}`);
  }

  const recAgentPt = ["recommendations:"];
  const recAgentEn = ["recommendations:"];
  for (const r of recomendacoes) {
    recAgentPt.push(`- ${r.autor} (${r.cargo_autor})`, `  "${r.texto}"`);
    recAgentEn.push(`- ${r.autor} (${en(r.cargo_autor)})`, `  "${en(r.texto)}"`);
  }

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" type="image/jpeg" href="/favicon.jpg?v=2">
<title>${esc(profile.nome_exibicao || profile.nome)} | Currículo e MCP Server</title>
<meta name="description" content="${esc(profile.resumo_curto || "")}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    color-scheme: dark;
    /* Pantone 7546C Mystic Navy, 12-1006 Mother of Pearl, 4975C Red Inferno */
    --navy: #13273f;
    --pearl: #e9d4c3;
    --inferno: #4e0000;
    --bg: #000;
    --bg-muted: var(--navy);
    --bg-emphasis: #1e3a57;
    --text: var(--pearl);
    --text-muted: #91857c;
    --border: rgba(36, 64, 92, 0.11);
    --theme: var(--pearl);
    --ember: #a8392f;
    --card: #090909;
    --radius: 6px;
    --gutter: 64px;
    --frame: 1312px;
    --grid: 28px;
    --font-sans: "Inter", -apple-system, "Segoe UI", sans-serif;
    --font-mono: "JetBrains Mono", monospace;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; scrollbar-gutter: stable; }
  body {
    margin: 0;
    background-color: var(--bg);
    color: var(--text);
    font-family: var(--font-sans);
    line-height: 1.5;
  }
  .grid-dots {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
    display: block;
  }
  .mono { font-family: var(--font-mono); }
  h1, h2, h3 { letter-spacing: -0.03em; margin: 0; font-weight: 800; }
  p { margin: 0; }

  .frame { width: min(var(--frame), 100% - 16px); margin: 0 auto; }
  .cell { position: relative; }
  .pad { padding: 56px var(--gutter); }
  @media (max-width: 1023px) { :root { --gutter: 32px; } }
  @media (max-width: 767px) { :root { --gutter: 12px; } .pad { padding: 32px var(--gutter); } }

  .cm { z-index: 2; pointer-events: none; width: 11px; height: 11px; position: absolute; }
  .cm::before { content: ""; width: 1px; height: 11px; top: 0; left: 5px; background: var(--text); position: absolute; }
  .cm::after { content: ""; width: 11px; height: 1px; top: 5px; left: 0; background: var(--text); position: absolute; }
  .cm.tl { top: -6px; left: -6px; }
  .cm.tr { top: -6px; right: -6px; }

  .tag { z-index: 3; font-family: var(--font-mono); color: var(--text-muted); pointer-events: none; font-size: 12px; line-height: 1; position: absolute; top: 12px; left: 16px; }

  .index {
    font-family: var(--font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin: 0 0 20px;
    font-size: 11px;
    font-weight: 400;
    display: block;
  }
  .caption { font-family: var(--font-mono); color: var(--text-muted); font-size: 11px; line-height: 1.3; }
  .muted { color: var(--text-muted); }
  .meta { font-family: var(--font-mono); color: var(--text-muted); font-size: 12px; }
  .head-row { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }

  /* nav */
  .nav {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    gap: 16px;
    height: 64px;
    padding: 0 32px;
  }
  .brand { font-family: var(--font-mono); color: var(--text); display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; text-decoration: none; }
  .nav-links { font-family: var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase; display: flex; align-items: center; gap: 28px; font-size: 12px; }
  .nav-links a { color: var(--text-muted); text-decoration: none; }
  .nav-links a:hover { color: var(--text); }
  .nav-end { display: flex; justify-content: flex-end; align-items: center; gap: 16px; }
  .badge {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--theme);
    border: 1px solid var(--border);
    padding: 6px 12px;
    border-radius: var(--radius);
  }
  @media (max-width: 899px) { .nav-links { display: none; } }

  /* agent switch + language picker */
  .switch-label { display: inline-flex; align-items: center; gap: 8px; padding: 4px 0; cursor: pointer; }
  .pui-switch {
    appearance: none;
    box-sizing: border-box;
    width: 27px;
    height: 14px;
    margin: 0;
    flex: none;
    border: 1px solid var(--border);
    border-radius: 9999px;
    background-color: transparent;
    background-repeat: no-repeat;
    background-image: radial-gradient(circle, var(--border) 0 42%, transparent 43%);
    background-size: 14px 100%;
    background-position: 0;
    cursor: pointer;
    transition: background-color 0.15s, background-position 0.15s, border-color 0.15s;
  }
  .pui-switch:checked {
    background-color: var(--theme);
    border-color: var(--theme);
    background-image: radial-gradient(circle, var(--bg) 0 42%, transparent 43%);
    background-position: 100%;
  }
  .switch-label span { font-family: var(--font-mono); color: var(--text-muted); font-size: 12px; }
  .lang { display: inline-flex; font-family: var(--font-mono); }
  .lang-btn {
    font: inherit;
    font-size: 12px;
    padding: 5px 9px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text);
    cursor: pointer;
    margin-left: -1px;
  }
  .lang-btn:first-child { margin-left: 0; border-radius: var(--radius) 0 0 var(--radius); }
  .lang-btn:last-child { border-radius: 0 var(--radius) var(--radius) 0; }
  .lang-btn.is-active { background: var(--bg-emphasis); color: var(--text); cursor: default; }

  /* agent view */
  .agent-text {
    display: none;
    font-family: var(--font-mono);
    color: var(--text);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    margin: 0;
    padding: 24px var(--gutter) 40px;
    font-size: 13px;
    line-height: 1.7;
  }
  /* Inside the hero the agent copy sits in the text column, not full width. */
  .hero-text .agent-text { padding: 0 0 8px; }
  body.agent-mode .human { display: none; }
  body.agent-mode .agent-text { display: block; animation: wipe 0.4s cubic-bezier(0.2, 0.7, 0.2, 1); }
  @keyframes wipe { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0); } }
  @media (prefers-reduced-motion: reduce) { body.agent-mode .agent-text { animation: none; } }

  /* buttons / chips */
  .pui-btn { display: inline-flex; justify-content: center; align-items: center; gap: 6px; padding: 8px 16px; border: 1px solid transparent; border-radius: var(--radius); font: inherit; font-size: 14px; white-space: nowrap; cursor: pointer; text-decoration: none; line-height: 1.25; }
  .pui-solid.pui-theme { background: var(--theme); color: var(--bg); }
  .pui-outline.pui-surface { background: transparent; border-color: var(--border); color: var(--text); }
  .pui-soft.pui-muted { background: color-mix(in oklab, var(--text-muted) 15%, transparent); color: var(--text-muted); border-color: transparent; }
  .chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
  .pui-chip { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border: 1px solid var(--border); border-radius: var(--radius); font-size: 12px; font-family: var(--font-mono); color: var(--text-muted); }

  /* hero */
  .hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  @media (max-width: 899px) { .hero { grid-template-columns: minmax(0, 1fr); } }
  .hero-text { position: relative; z-index: 1; display: flex; flex-direction: column; padding: 80px var(--gutter) 56px; }
  @media (max-width: 899px) { .hero-text { padding: 44px var(--gutter) 32px; } .hero-text .index { margin-bottom: 20px; } }
  .hero-text .index { margin-bottom: 36px; }
  .hero h1 { max-width: 560px; font-size: 60px; line-height: 1.04; }
  @media (max-width: 1023px) { .hero h1 { font-size: 48px; } }
  @media (max-width: 899px) { .hero h1 { font-size: 40px; line-height: 1.05; } }
  .hero-label { color: var(--text-muted); margin-top: 36px; font-size: 17px; line-height: 1.75; }
  @media (max-width: 899px) { .hero-label { margin-top: 20px; font-size: 15px; } }
  .hero-label .pui-chip { font-size: 13px; padding: 5px 12px; vertical-align: 1px; margin-inline: 2px; color: var(--text); }
  .hero-about { max-width: 620px; margin-top: 28px; font-size: 17px; line-height: 1.65; color: var(--text-muted); }
  @media (max-width: 899px) { .hero-about { margin-top: 20px; font-size: 16px; } }

  .install { display: flex; flex-direction: column; gap: 10px; max-width: 560px; margin-top: 36px; }
  .install [role="tablist"] { align-self: flex-start; display: flex; flex-wrap: wrap; row-gap: 6px; }
  .install [role="tablist"] button { font-family: var(--font-mono); font-size: 12px; padding: 6px 14px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); cursor: pointer; margin-left: -1px; transition: color 0.25s ease, background-color 0.25s ease; }
  .install [role="tablist"] button:first-child { margin-left: 0; border-top-left-radius: var(--radius); border-bottom-left-radius: var(--radius); }
  .install [role="tablist"] button:last-child { border-top-right-radius: var(--radius); border-bottom-right-radius: var(--radius); }
  .install [role="tablist"] button[aria-selected="true"] { color: var(--text); background: var(--bg-muted); }
  .install-field { background: var(--card); display: flex; flex-wrap: wrap; row-gap: 8px; align-items: center; gap: 12px; padding: 12px 12px 12px 18px; border: 1px solid var(--border); border-radius: var(--radius); }
  .install-cmds { display: grid; flex: 1 0 auto; max-width: 100%; min-width: 0; }
  /* Keep every command in flow (grid-area stack) so the field never changes
     width or height; only opacity crossfades between them. */
  .install-cmds > code {
    grid-area: 1 / 1;
    font-family: var(--font-mono); font-size: 13px; color: var(--text); overflow-x: auto;
    opacity: 1; pointer-events: auto;
    transition: opacity 0.3s ease;
  }
  .install-cmds > code[hidden] { display: block; opacity: 0; pointer-events: none; }
  @media (prefers-reduced-motion: reduce) {
    .install-cmds > code { transition: none; }
  }
  .install-field button { margin-left: auto; }

  .hero-links { display: flex; flex-wrap: wrap; gap: 12px 16px; margin-top: 28px; }

  .hero-portrait {
    position: relative;
    min-width: 0;
    overflow: clip;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 480px;
  }
  @media (max-width: 899px) { .hero-portrait { min-height: 320px; } }
  /* Blacks out the center so the portrait itself stays clean, but lets the
     fixed background dot field bleed in only near the edges of the box.
     Sits behind the canvas (source order, no z-index) so the face effect
     always paints on top of it. */
  .hero-portrait::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(ellipse at center, var(--bg) 40%, transparent 100%);
  }
  #portrait-canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
  .portrait-caption { z-index: 3; background: var(--bg); padding: 2px 6px; position: absolute; bottom: 12px; left: 16px; font-family: var(--font-mono); color: var(--text-muted); font-size: 11px; }

  /* numbers */
  .numbers { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
  @media (max-width: 1023px) { .numbers { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  .numbers > .stat { border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); margin: 0 -1px -1px 0; }
  .stat { display: flex; flex-direction: column; gap: 14px; min-width: 0; padding: 36px 32px 34px; }
  @media (max-width: 1023px) { .stat { padding: 24px var(--gutter); gap: 10px; } }
  .stat-value { display: flex; align-items: baseline; gap: 8px; }
  .num { letter-spacing: -0.03em; font-variant-numeric: tabular-nums; font-size: 52px; font-weight: 800; line-height: 1; }
  @media (max-width: 1023px) { .num { font-size: 34px; } }
  .stat-label { font-family: var(--font-mono); color: var(--text-muted); font-size: 11px; line-height: 1.5; }

  /* skills lattice */
  .cells-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
  @media (max-width: 1023px) { .cells-3 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 560px) { .cells-3 { grid-template-columns: minmax(0, 1fr); } }
  .cells-3 > .skill-cell { border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); margin: 0 -1px -1px 0; padding: 32px; }
  .skill-cell h3 { font-size: 15px; font-weight: 600; margin: 0 0 14px; }

  /* timeline */
  .timeline-wrap { position: relative; padding: 0 var(--gutter) 56px; }
  .checkpoint-list { list-style: none; margin: 0; padding: 0; }
  .checkpoint { display: flex; gap: 16px; padding-bottom: 28px; position: relative; }
  .checkpoint:not(:last-child)::before { content: ""; position: absolute; left: 4px; top: 20px; bottom: 0; border-left: 1px solid var(--border); }
  .checkpoint-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--ember); margin-top: 6px; flex-shrink: 0; position: relative; z-index: 1; }
  .checkpoint-body { flex: 1; }
  .checkpoint-body h3 { font-size: 16px; font-weight: 600; }
  .checkpoint-body .company { font-size: 14px; margin: 4px 0 12px; }
  /* What was built and delivered, in place of a stack chip row. */
  .delivered { list-style: none; margin: 0; padding: 0; display: grid; gap: 9px; }
  .delivered li { position: relative; padding-left: 16px; font-size: 13.5px; line-height: 1.6; color: var(--text-muted); }
  .delivered li::before { content: ""; position: absolute; left: 0; top: 10px; width: 6px; height: 1px; background: var(--ember); }
  .skill-copy { font-size: 13.5px; line-height: 1.65; color: var(--text-muted); }
  .pct { font-size: 0.55em; vertical-align: super; margin-left: 1px; }

  /* Reveal on scroll. */
  .reveal { opacity: 0; transform: translateY(14px); transition: opacity 0.55s cubic-bezier(0.2, 0.7, 0.2, 1), transform 0.55s cubic-bezier(0.2, 0.7, 0.2, 1); }
  .reveal.in { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) {
    .reveal { opacity: 1; transform: none; transition: none; }
  }

  /* projects */
  .grid3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; padding: 0 var(--gutter) 56px; }
  @media (max-width: 1023px) { .grid3 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 767px) { .grid3 { grid-template-columns: minmax(0, 1fr); } }
  .pui-card {
    position: relative;
    border: 1px solid var(--border);
    border-radius: calc(var(--radius) * 1.5);
    overflow: hidden;
  }
  /* Same treatment as the hero portrait: the card itself stays readable in
     the center, but its background dot-bleeds into the fixed page field at
     the edges instead of sitting as a flat opaque rectangle. */
  .pui-card::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: radial-gradient(ellipse at center, var(--card) 40%, transparent 100%);
  }
  .pui-card-content { position: relative; z-index: 1; }
  .pui-card-content { display: grid; gap: 12px; padding: 20px; }
  a.pui-card { color: inherit; text-decoration: none; display: flex; flex-direction: column; transition: border-color 0.15s ease; }
  a.pui-card:hover { border-color: var(--text-muted); }
  .card-title-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .card-name { font-family: var(--font-mono); font-size: 15px; font-weight: 600; }
  .chip-n { font-family: var(--font-mono); opacity: 0.6; font-size: 11px; font-variant-numeric: tabular-nums; }

  .section-title { font-size: clamp(1.6rem, 2.6vw, 2.1rem); margin: 0 0 22px; }

  /* Products: one headline figure each, counted from the repos themselves. */
  .products { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
  @media (max-width: 900px) { .products { grid-template-columns: 1fr; } }
  .product {
    display: flex; flex-direction: column;
    padding: 32px var(--gutter) 36px;
    border-right: 1px solid var(--border); border-bottom: 1px solid var(--border);
    margin: 0 -1px -1px 0;
    color: inherit; text-decoration: none;
    transition: background 0.15s;
  }
  .product:hover { background: var(--card); }
  .product-name { font-family: var(--font-mono); font-size: 17px; font-weight: 600; }
  .product-lead { margin: 12px 0 0; font-size: 13.5px; line-height: 1.6; color: var(--text-muted); max-width: 42ch; }
  .product-figure { margin-top: auto; padding-top: 28px; display: flex; align-items: baseline; gap: 12px; }
  .product-figure .num { font-size: clamp(2.6rem, 4vw, 3.4rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1; font-variant-numeric: tabular-nums; }
  .product-label { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); max-width: 16ch; line-height: 1.4; }
  .product-sub { margin: 14px 0 0; padding-top: 14px; border-top: 1px solid var(--border); font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }
  .facets { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; padding-bottom: 36px; }
  /* A hairline between groups, flowing with the chips so a line always fills. */
  .facet-sep { width: 1px; height: 18px; background: var(--border); margin: 0 7px; flex: none; }
  .facet {
    display: inline-flex; align-items: center; gap: 6px;
    font: inherit; font-family: var(--font-mono); font-size: 12px;
    padding: 5px 11px; border: 1px solid var(--border); border-radius: var(--radius);
    background: transparent; color: var(--text-muted); cursor: pointer;
    transition: color 0.15s, border-color 0.15s, background 0.15s;
  }
  .facet:hover { color: var(--text); border-color: var(--text-muted); }
  .facet.is-active { background: var(--text); color: var(--bg); border-color: var(--text); }
  .facet-n { font-size: 10px; opacity: 0.65; font-variant-numeric: tabular-nums; }

  /* Project cards: one shape, footer pinned so rows line up. */
  .proj-card {
    display: flex; flex-direction: column;
    background: var(--card); border: 1px solid var(--border);
    border-radius: calc(var(--radius) * 1.5); padding: 20px;
    color: inherit; text-decoration: none;
    transition: border-color 0.2s ease, box-shadow 0.45s ease, opacity 0.35s ease;
  }
  .proj-card:hover { border-color: var(--text-muted); }
  /* Layered, wide-radius shadows read as smoke rather than a hard ring. */
  .proj-card.match {
    border-color: rgba(233, 212, 195, 0.42);
    box-shadow:
      0 0 0 1px rgba(233, 212, 195, 0.10),
      0 0 20px -6px rgba(233, 212, 195, 0.22),
      0 0 54px -12px rgba(233, 212, 195, 0.16),
      0 0 110px -30px rgba(233, 212, 195, 0.12);
  }
  .proj-card.dim { opacity: 0.32; }
  @media (prefers-reduced-motion: reduce) { .proj-card { transition: none; } }
  .proj-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .proj-name { font-family: var(--font-mono); font-size: 15px; font-weight: 600; }
  .proj-status {
    font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.04em;
    padding: 3px 8px; border-radius: 999px; white-space: nowrap;
    color: #7ee0a0; background: rgba(126, 224, 160, 0.12);
  }
  .proj-status.wip { color: var(--pearl); background: rgba(233, 212, 195, 0.14); }
  .proj-meta { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); margin: 10px 0 0; line-height: 1.5; }
  .proj-desc { font-size: 13.5px; line-height: 1.6; color: var(--text-muted); margin: 12px 0 0; }
  .proj-foot { margin-top: auto; padding-top: 18px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .proj-link { font-size: 13px; text-decoration: underline; text-underline-offset: 3px; }
  .proj-foot .repo-meta { border: 0; padding: 0; margin: 0; }
  /* Live GitHub facts, refreshed on each render. */
  .repo-meta { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 10px; margin-top: 2px; }

  .rec-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; padding: 0 var(--gutter) 56px; }
  @media (max-width: 767px) { .rec-grid { grid-template-columns: minmax(0, 1fr); } }
  .lead-sm { font-size: 15px; line-height: 1.6; margin-bottom: 16px; }
  .pui-card footer strong { display: block; font-size: 14px; }
  .pui-card footer span { font-size: 12px; }

  .agents-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(28px, 5vw, 72px); align-items: start; padding-top: 18px; }
  @media (max-width: 860px) { .agents-grid { grid-template-columns: 1fr; } }
  .agents-lead { max-width: 46ch; color: var(--text-muted); font-size: 15px; line-height: 1.65; }
  .agents-actions { display: grid; gap: 18px; }
  .agents-actions .install-field { margin: 0; }
  .agents-actions code { color: var(--text); }
  .agents-tools { display: grid; gap: 10px; }
  .tools-label { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); }

  .site-footer { font-family: var(--font-mono); color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 28px 32px; font-size: 12px; border-bottom: none; }
  .profiles { display: flex; flex-wrap: wrap; gap: 8px 24px; margin: 0; padding: 0; list-style: none; }
  .profiles a { color: var(--text-muted); text-decoration: none; }
  .profiles a:hover { color: var(--text); }
  .made-by { opacity: 0.6; }
  @media (max-width: 767px) { .site-footer { flex-direction: column; align-items: flex-start; } }
</style>
</head>
<body>
  <canvas class="grid-dots" aria-hidden="true"></canvas>
  <div class="frame">
    <header class="cell nav">
      ${cm()}
      <span></span>
      <nav class="nav-links">
        <a href="#trajetoria">${uiText("navTrajectory")}</a>
        <a href="#projetos">${uiText("navProjects")}</a>
        <a href="#agentes">${uiText("navAgents")}</a>
      </nav>
      <div class="nav-end">
        <label class="switch-label" for="agent-view">
          <input type="checkbox" class="pui-switch" id="agent-view">
          ${uiText("agentToggle")}
        </label>
        <span class="lang">
          <button type="button" class="lang-btn is-active" data-lang="en" aria-current="true">EN</button>
          <button type="button" class="lang-btn" data-lang="pt">PT</button>
        </span>
      </div>
    </header>

    <section class="cell hero" aria-labelledby="name">
      ${cm()}
      <div class="hero-text">
        <span class="index">${uiText("idxIndex")}</span>
        <h1 id="name">${esc(profile.nome_exibicao || profile.nome)}</h1>

        <div class="human">
          <p class="hero-label">
            ${uiText("heroLabelA")}
          </p>
          <p class="hero-about">${uiText("heroAbout")}</p>
        </div>
        ${agentBlock(heroAgentPt, heroAgentEn)}

        <div class="install">
          <div role="tablist" aria-label="MCP">
            ${MCP_CLIENTS.map((c, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-cmd="${esc(c.id)}">${esc(c.label)}</button>`).join("")}
          </div>
          <div class="install-field">
            <div class="install-cmds">
              ${MCP_CLIENTS.map((c, i) => `<code data-cmd="${esc(c.id)}"${i === 0 ? "" : " hidden"}>${esc(c.cmd)}</code>`).join("")}
            </div>
            <button type="button" class="pui-btn pui-outline pui-surface" id="copy-btn" ${bi("Copiar", "Copy")}>Copy</button>
          </div>
        </div>

        <div class="hero-links">
          ${profile.contato?.linkedin ? `<a class="pui-btn pui-outline pui-surface" href="${esc(profile.contato.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : ""}
          ${profile.contato?.github ? `<a class="pui-btn pui-outline pui-surface" href="${esc(profile.contato.github)}" target="_blank" rel="noopener">GitHub</a>` : ""}
          <a class="pui-btn pui-outline pui-surface" href="mailto:jeansaantos89@gmail.com" ${bi("Enviar email", "Send email")}>Send email</a>
          <a class="pui-btn pui-outline pui-surface" id="resume-link" href="/resume?lang=en" download ${bi("Baixar currículo", "Download resume")}>Download resume</a>
        </div>
      </div>

      <div class="hero-portrait">
        <video id="portrait-video" src="/portrait.mp4" muted loop playsinline autoplay style="display:none"></video>
        <canvas id="portrait-canvas"></canvas>
      </div>
    </section>

    <section class="cell" style="padding: 56px var(--gutter) 0;">
      <span class="index">${uiText("idxNumbers")}</span>
    </section>
    <div class="human">
      <div class="numbers">
        ${stat(409, "statRules")}
        ${stat(98, "statRegression", "%")}
        ${stat(92, "statCoverage", "%")}
        ${stat(30, "statHeartbeat", "min")}
      </div>
    </div>
    ${agentBlock(numbersAgentPt, numbersAgentEn)}

    <section class="cell" style="padding: 56px var(--gutter) 0;">
      <span class="index">${uiText("idxProducts")}</span>
      <h2 class="section-title">${uiText("productsHeadline")}</h2>
    </section>
    <div class="human"><div class="products">${productCards}</div></div>
    ${agentBlock(productsAgentPt, productsAgentEn)}

    <section class="cell" style="padding: 56px var(--gutter) 0;">
      <span class="index">${uiText("idxSkills")}</span>
    </section>
    <div class="human"><div class="cells-3">${skillCells}</div></div>
    ${agentBlock(skillsAgentPt, skillsAgentEn)}

    <section class="cell pad" id="trajetoria">
      <span class="index">${uiText("idxTrajectory")}</span>
    </section>
    <div class="human">
      <div class="timeline-wrap">
        <ul class="checkpoint-list">${expEntries}</ul>
      </div>
    </div>
    ${agentBlock(expAgentPt, expAgentEn)}

    <section class="cell" style="padding: 56px var(--gutter) 0;" id="projetos">
      <span class="index">${uiText("idxProjects")}</span>
      <h2 class="section-title">${uiText("projectsHeadline")}</h2>
      <div class="facets">${projFacets}</div>
    </section>
    <div class="human"><div class="grid3">${projCards}</div></div>
    ${agentBlock(projAgentPt, projAgentEn)}

    <section class="cell" style="padding: 56px var(--gutter) 0;">
      <span class="index">${uiText("idxRecs")}</span>
    </section>
    <div class="human"><div class="rec-grid">${recCards}</div></div>
    ${agentBlock(recAgentPt, recAgentEn)}

    <section class="cell pad agents-cell" id="agentes">
      <div class="agents-grid">
        <div>
          <span class="index">${uiText("idxAgents")}</span>
          <h2 class="section-title">${uiText("agentsHeadline")}</h2>
          <p class="agents-lead">${uiText("agentsLead")}</p>
        </div>
        <div class="agents-actions">
          <div class="install-field">
            <div class="install-cmds"><code id="mcp-url">${esc(MCP_URL)}</code></div>
            <button type="button" class="pui-btn pui-outline pui-surface" id="copy-url" ${bi("Copiar", "Copy")}>Copy</button>
          </div>
          <div class="agents-tools">
            <span class="tools-label" ${bi(ui("toolsLabel")[0], ui("toolsLabel")[1])}>${esc(ui("toolsLabel")[1])}</span>
            <div class="chip-row">${MCP_TOOLS.map((x) => `<span class="pui-chip pui-outline pui-surface">${esc(x)}</span>`).join("")}</div>
          </div>
        </div>
      </div>
    </section>

    <footer class="site-footer">
      <ul class="profiles">
        ${profile.contato?.github ? `<li><a href="${esc(profile.contato.github)}" target="_blank" rel="noopener">GitHub ${esc(profile.github_usuario || "")}</a></li>` : ""}
        ${profile.contato?.linkedin ? `<li><a href="${esc(profile.contato.linkedin)}" target="_blank" rel="noopener">LinkedIn jean-santos72</a></li>` : ""}
        <li><a href="#agentes">MCP /mcp</a></li>
        <li><a href="mailto:jeansaantos89@gmail.com" ${bi("Enviar email", "Send email")}>Send email</a></li>
      </ul>
      <span class="made-by">Made with Claude Opus 5.5</span>
    </footer>
  </div>

  <script>
    // Background dot field. The cursor acts as a vacuum: dots inside its
    // radius are drawn toward it, opening a void in the grid instead of
    // scattering outward. Brightness stays constant: the gap is the effect.
    (function () {
      const canvas = document.querySelector(".grid-dots");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      const GRID = 28;
      const DOT_R = 0.7;
      const PULL_RADIUS = 115;   // px of influence around the pointer
      const PULL_STRENGTH = 0.62; // fraction of the gap each dot closes
      const EASE = 0.14;          // how quickly a dot reacts and settles back
      const BASE = { r: 120, g: 120, b: 120 };
      // Dots sitting behind copy are pushed further down so they never
      // compete with the text for attention.
      const ALPHA_OPEN = 0.86;
      const ALPHA_TEXT = 0.25;
      const TEXT_SEL = "h1, h2, h3, p, code, li, .index, .stat-label, .card-name, .meta, .pui-chip, .lang-btn, .switch-label, .brand, .nav-links a, .repo-meta";

      let vw = 0;
      let vh = 0;
      let dots = [];
      let maskCols = 0;
      let maskRows = 0;
      let mask = new Uint8Array(0);

      function layout() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        vw = window.innerWidth;
        vh = window.innerHeight;
        canvas.width = vw * dpr;
        canvas.height = vh * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // The field is laid out once across the whole document (not just one
        // viewport-full, re-tiled on scroll), so each row's jitter is unique
        // and scrolling reveals new randomness instead of the same pattern
        // looping every GRID pixels.
        const docH = Math.max(document.documentElement.scrollHeight, vh);
        dots = [];
        maskCols = Math.ceil(vw / GRID) + 1;
        maskRows = Math.ceil(docH / GRID) + 1;
        mask = new Uint8Array(maskCols * maskRows);
        // Jittered off the grid (not a pure random scatter) so the text mask
        // lookup by cell still lines up: each dot wanders within its own
        // cell instead of landing anywhere on screen.
        const JITTER = GRID * 0.38;
        for (let y = 0; y < maskRows; y++) {
          for (let x = 0; x < maskCols; x++) {
            dots.push({
              gx: x,
              gy: y,
              // Document-space position; paint() subtracts scrollY each frame.
              x: x * GRID + (Math.random() * 2 - 1) * JITTER,
              y: y * GRID + (Math.random() * 2 - 1) * JITTER,
              pull: 0,
              // Own phase and speed so the idle drift below isn't a single
              // wave moving across the field, just quiet independent wander.
              phase: Math.random() * Math.PI * 2,
              speed: 0.00025 + Math.random() * 0.00025,
            });
          }
        }
        markText();
      }

      // Rasterise the text boxes into the dot grid (document space) so each
      // dot knows whether it is sitting under copy.
      function markText() {
        if (!mask.length) return;
        mask.fill(0);
        const pad = 6;
        const scrollY = window.scrollY;
        for (const el of document.querySelectorAll(TEXT_SEL)) {
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          const top = r.top + scrollY;
          const bottom = r.bottom + scrollY;
          const x0 = Math.max(0, Math.floor((r.left - pad) / GRID));
          const x1 = Math.min(maskCols - 1, Math.ceil((r.right + pad) / GRID));
          const y0 = Math.max(0, Math.floor((top - pad) / GRID));
          const y1 = Math.min(maskRows - 1, Math.ceil((bottom + pad) / GRID));
          for (let y = y0; y <= y1; y++) {
            for (let x = x0; x <= x1; x++) mask[y * maskCols + x] = 1;
          }
        }
      }

      let markQueued = false;
      function queueMark() {
        if (markQueued) return;
        markQueued = true;
        requestAnimationFrame(() => {
          markQueued = false;
          markText();
        });
      }
      window.addEventListener("scroll", queueMark, { passive: true });
      window.addEventListener("resize", layout);
      layout();

      const pointer = { x: -9999, y: -9999, inside: false };
      window.addEventListener("pointermove", (e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        pointer.inside = true;
      }, { passive: true });
      document.addEventListener("pointerleave", () => { pointer.inside = false; });

      // Idle amplitude of the ambient wander, in px. Kept tiny on purpose:
      // just enough that the field doesn't read as a static image.
      const DRIFT_AMP = 1.4;

      function paint(now) {
        ctx.clearRect(0, 0, vw, vh);
        const open = new Path2D();
        const dim = new Path2D();
        const scrollY = window.scrollY;

        for (const d of dots) {
          const baseY = d.y - scrollY;
          if (baseY < -GRID || baseY > vh + GRID) continue;
          const dx = pointer.x - d.x;
          const dy = pointer.y - baseY;
          const dist = Math.hypot(dx, dy);

          let target = 0;
          if (pointer.inside && dist < PULL_RADIUS) {
            const n = 1 - dist / PULL_RADIUS;
            target = n * n * (3 - 2 * n); // smoothstep
          }
          d.pull += (target - d.pull) * EASE;

          const wt = now * d.speed + d.phase;
          let px = d.x + Math.sin(wt) * DRIFT_AMP;
          let py = baseY + Math.cos(wt * 0.85) * DRIFT_AMP;
          if (d.pull > 0.002 && dist > 0.001) {
            // Capped at the radius so a distant pointer can never scale
            // the displacement without bound.
            const move = Math.min(dist, PULL_RADIUS) * PULL_STRENGTH * d.pull;
            px += (dx / dist) * move;
            py += (dy / dist) * move;
          }

          const path = mask[d.gy * maskCols + d.gx] === 1 ? dim : open;
          path.moveTo(px + DOT_R, py);
          path.arc(px, py, DOT_R, 0, Math.PI * 2);
        }

        const rgb = BASE.r + "," + BASE.g + "," + BASE.b;
        ctx.fillStyle = "rgba(" + rgb + "," + ALPHA_OPEN + ")";
        ctx.fill(open);
        ctx.fillStyle = "rgba(" + rgb + "," + ALPHA_TEXT + ")";
        ctx.fill(dim);
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        paint(0);
        return;
      }

      // The idle drift means the field never truly settles, so the loop just
      // runs continuously instead of sleeping between interactions.
      function loop(now) {
        paint(now);
        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);

    })();

    (function () {
      const canvas = document.getElementById("portrait-canvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const sample = document.createElement("canvas");
      const sctx = sample.getContext("2d", { willReadFrequently: true });

      let cols = 100;
      let rows = 72;
      let pulls = new Float32Array(0);
      // A flag, not a sentinel coordinate, on purpose: the
      // pull is proportional to distance, so parking the cursor at -9999
      // turns it into a far-away attractor that flings cells off screen.
      const mouse = { x: 0, y: 0, over: false };
      // Lit skin on a black plate: the keying drops the wall, and the tone
      // curve pushes hair and shirt down so the face carries the image.
      const INK = { r: 233, g: 212, b: 195 };
      const PAPER = { r: 0, g: 0, b: 0 };
      const POOL =
        "playwright.typescript.mcp.rag.deepeval.shift-left.e2e.appium." +
        "cypress.github-actions.regressao.qa.sdet.auto-healing.qa-memory." +
        "409-regras.grafana.jira.gherkin.contract-tests.heartbeat.";

      function setupGrid() {
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, rect.width * dpr);
        canvas.height = Math.max(1, rect.height * dpr);
        const containerAspect = rect.width / rect.height || 1;
        cols = 100;
        rows = Math.max(1, Math.round(cols / containerAspect));
        sample.width = cols;
        sample.height = rows;
        pulls = new Float32Array(cols * rows);
      }

      // Auto-levels, re-derived from the clip itself. A portrait can be shot
      // either way round: against a lit wall, where the backdrop is the
      // brightest thing, or in the dark with only the face lit. Assuming one
      // polarity silently destroys the other, so the backdrop is identified
      // by being the dominant cluster, whichever end it sits at.
      let LEVEL_LO = 0;      // tone that maps to nothing
      let LEVEL_HI = 0.85;   // tone that maps to full ink
      let CLIP_HIGH = true;  // drop everything at or above LEVEL_HI
      let calibrated = false;

      function calibrate(data) {
        const BINS = 20;
        const h = new Array(BINS).fill(0);
        let total = 0;
        for (let i = 0; i < data.length; i += 4) {
          const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
          h[Math.min(BINS - 1, Math.floor(lum * BINS))]++;
          total++;
        }

        let peak = 0;
        for (let i = 1; i < BINS; i++) if (h[i] > h[peak]) peak = i;
        const peakN = h[peak];

        if (peak < BINS / 2) {
          // Dark backdrop: walk up out of it, then take a high percentile as
          // the white point so the lit face spans the full range.
          let i = peak;
          while (i < BINS - 1 && h[i + 1] > peakN * 0.25) i++;
          LEVEL_LO = (i + 1) / BINS;
          let acc = 0;
          let hi = BINS - 1;
          for (let k = 0; k < BINS; k++) {
            acc += h[k];
            if (acc >= total * 0.99) { hi = k; break; }
          }
          LEVEL_HI = Math.max(LEVEL_LO + 0.1, (hi + 1) / BINS);
          CLIP_HIGH = false;
        } else {
          // Lit backdrop: the valley below the cluster separates it from the
          // subject, and everything above is keyed out.
          let i = peak;
          while (i > 1 && h[i - 1] > peakN * 0.25) i--;
          LEVEL_LO = 0;
          LEVEL_HI = i / BINS;
          CLIP_HIGH = true;
        }
        calibrated = true;
      }

      const video = document.getElementById("portrait-video");

      function onVideoReady() {
        setupGrid();
        video.play().catch(() => {});
        requestAnimationFrame(draw);
      }
      // autoplay can fetch metadata before this script runs, so the event
      // may already have fired by the time we attach the listener.
      if (video.readyState >= 1) {
        onVideoReady();
      } else {
        video.addEventListener("loadedmetadata", onVideoReady, { once: true });
      }

      window.addEventListener("resize", setupGrid);
      // The hero column settles after fonts load, so recompute the grid
      // whenever the container itself changes size.
      if (window.ResizeObserver) {
        new ResizeObserver(setupGrid).observe(canvas.parentElement);
      }

      const host = canvas.parentElement;
      window.addEventListener("pointermove", (e) => {
        // Canvas-space copy drives the per-cell highlight, which should still
        // only react when the cursor is actually over the portrait.
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const inside =
          e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top && e.clientY <= rect.bottom;
        mouse.over = inside;
        if (inside) {
          mouse.x = (e.clientX - rect.left) * dpr;
          mouse.y = (e.clientY - rect.top) * dpr;
        }
      }, { passive: true });

      // When the cursor leaves the page the gaze holds its last heading: the
      // position is kept, only the vacuum is released. Clearing the heading
      // here would snap the head back to centre, which reads as a flick.
      function pointerAway() {
        mouse.over = false;
      }
      document.addEventListener("pointerleave", pointerAway);
      window.addEventListener("blur", pointerAway);
      // A fast exit can outrun pointermove, leaving the pull latched on.
      host.addEventListener("pointerleave", () => {
        mouse.over = false;
      });

      function draw() {
        requestAnimationFrame(draw);
        if (video.readyState < 2 || !canvas.width) return;

        const vw = video.videoWidth;
        const vh = video.videoHeight;

        // Cover: fill the cell edge to edge, cropping the overflow,
        // anchored to the top so the head is never cut off.
        const scale = Math.max(cols / vw, rows / vh);
        const dw = vw * scale;
        const dh = vh * scale;
        const dx = (cols - dw) / 2;
        const dy = 0;

        sctx.fillStyle = "#fff";
        sctx.fillRect(0, 0, cols, rows);
        sctx.drawImage(video, dx, dy, dw, dh);
        const data = sctx.getImageData(0, 0, cols, rows).data;

        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        const cellW = w / cols;
        const cellH = h / rows;
        const dprNow = Math.min(window.devicePixelRatio || 1, 2);
        const reach = 130 * dprNow;
        // Same vacuum as the background field: cells inside the radius are
        // drawn toward the cursor, opening a hole in the portrait.
        const PULL_RADIUS = 95 * dprNow;
        const PULL_STRENGTH = 0.5;
        const PULL_EASE = 0.16;
        const LEVELS = 16;
        // The wall is the tallest bright cluster in the histogram and the
        // subject sits below a clear valley. Finding that valley at runtime
        // means a new clip with different exposure recalibrates itself
        // instead of silently keying out the face.
        const FADE_FROM = 0.95;
        // Gentler than before: the auto-levels above already discard the
        // backdrop, so the curve no longer has to crush it by brute force.
        const GAMMA = 1.5;
        const GAIN = 1.35;
        const FLOOR = 0.1;
        const TEXT_FROM = 0.72;
        if (!calibrated) calibrate(data);

        ctx.font = Math.max(5, cellW * 0.55) + "px ui-monospace, 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const ci = y * cols + x;
            const cx = (x + 0.5) * cellW;
            const cy = (y + 0.5) * cellH;
            const ddx = mouse.x - cx;
            const ddy = mouse.y - cy;
            const dist = mouse.over ? Math.hypot(ddx, ddy) : Infinity;

            // Decay runs for every cell, before the luminance filters below.
            // Skipping it for dark cells leaves their pull latched, so they
            // snap when the footage brightens them again.
            let target = 0;
            if (dist < PULL_RADIUS) {
              const n = 1 - dist / PULL_RADIUS;
              target = n * n * (3 - 2 * n); // smoothstep
            }
            // Release faster than it grabs, so leaving the box settles quickly.
            const ease = target > pulls[ci] ? PULL_EASE : PULL_EASE * 2.2;
            const pull = pulls[ci] + (target - pulls[ci]) * ease;
            pulls[ci] = pull;

            const idx = ci * 4;
            const lum = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255;
            // The source is shot against a bright wall. Key that background
            // out, then keep the subject's natural tones so the lit face
            // reads brightest and the dark shirt falls away into the black.
            if (CLIP_HIGH && lum >= LEVEL_HI) continue;
            const t = Math.max(0, Math.min(1, (lum - LEVEL_LO) / (LEVEL_HI - LEVEL_LO)));
            // Anti-aliased pixels along the background edge land just under
            // the cutoff; fade them out so the silhouette gets no glowing rim.
            const fade = t > FADE_FROM ? Math.max(0, 1 - (t - FADE_FROM) / (1 - FADE_FROM)) : 1;
            // Gamma pushes the dark shirt down into the black so only the lit
            // face and hands carry weight, instead of a flat grey mass.
            const norm = Math.min(1, Math.pow(t, GAMMA) * GAIN) * fade;
            if (norm < FLOOR) continue;
            const level = Math.round(norm * (LEVELS - 1)) / (LEVELS - 1);
            if (level <= 0) continue;

            const boost = mouse.over ? Math.max(0, 1 - dist / reach) : 0;

            let px = cx;
            let py = cy;
            if (pull > 0.002 && dist > 0.001 && dist < Infinity) {
              // Capped at the radius: without this a far cursor would scale
              // the displacement without bound.
              const move = Math.min(dist, PULL_RADIUS) * PULL_STRENGTH * pull;
              px += (ddx / dist) * move;
              py += (ddy / dist) * move;
            }

            const shade = Math.min(1, level * (0.85 + boost * 0.45));
            // Blend from paper to ink: shade 0 disappears into the page.
            const mix = (a, b) => Math.round(a + (b - a) * shade);
            ctx.fillStyle =
              "rgb(" + mix(PAPER.r, INK.r) + "," +
              mix(PAPER.g, INK.g) + "," +
              mix(PAPER.b, INK.b) + ")";

            if (level >= TEXT_FROM) {
              // The lit regions spell out the stack. Index by cell position
              // (not a running counter) so the letters stay put frame to
              // frame, and step by x so words read left to right.
              const ch = POOL[(x + y * 11) % POOL.length];
              ctx.fillText(ch, px, py);
            } else {
              const size = cellW * (0.3 + level * 0.7);
              ctx.fillRect(px - size / 2, py - size / 2, size, size);
            }
          }
        }
      }
    })();

    // Stagger each group so a section resolves in sequence, not all at once.
    // Re-plays every time: the element resets when it leaves view so the
    // same reveal happens again on every scroll past it, not just the first.
    const revealIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (!entry.isIntersecting) {
          el.classList.remove("in");
          return;
        }
        const siblings = [...(el.parentElement?.children || [])].filter((n) => n.classList.contains("reveal"));
        el.style.transitionDelay = Math.min(siblings.indexOf(el), 6) * 60 + "ms";
        el.classList.add("in");
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach((el) => revealIo.observe(el));

    const countIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (!entry.isIntersecting) {
          delete el.dataset.counting;
          return;
        }
        if (el.dataset.counting) return;
        el.dataset.counting = "1";
        const target = parseInt(el.dataset.count, 10);
        el.textContent = "0";
        const start = performance.now();
        const dur = 1100;
        function step(now) {
          if (!el.dataset.counting) return;
          const p = Math.min(1, (now - start) / dur);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll(".num").forEach((el) => countIo.observe(el));

    document.getElementById("agent-view")?.addEventListener("change", (e) => {
      document.body.classList.toggle("agent-mode", e.target.checked);
    });

    const langButtons = document.querySelectorAll(".lang-btn");
    const resumeLink = document.getElementById("resume-link");
    function setLang(lang) {
      document.documentElement.lang = lang === "en" ? "en" : "pt-br";
      document.querySelectorAll("[data-pt][data-en]").forEach((el) => {
        el.textContent = lang === "en" ? el.dataset.en : el.dataset.pt;
      });
      if (resumeLink) resumeLink.href = "/resume?lang=" + (lang === "en" ? "en" : "pt");
      langButtons.forEach((b) => {
        const active = b.dataset.lang === lang;
        b.classList.toggle("is-active", active);
        if (active) b.setAttribute("aria-current", "true");
        else b.removeAttribute("aria-current");
      });
    }
    langButtons.forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

    const facets = document.querySelectorAll(".facet");
    const cards = document.querySelectorAll(".proj-card");
    facets.forEach((f) => {
      f.addEventListener("click", () => {
        facets.forEach((x) => x.classList.toggle("is-active", x === f));
        const key = f.dataset.facet;
        const [kind, value] = key === "all" ? ["all"] : [key.slice(0, key.indexOf(":")), key.slice(key.indexOf(":") + 1)];
        cards.forEach((card) => {
          let hit = true;
          if (kind === "status") hit = card.dataset.status === value;
          else if (kind === "cat") hit = card.dataset.cat === value;
          else if (kind === "tech") hit = (card.dataset.tech || "").split("|").includes(value);
          // Matching cards glow, the rest recede. Nothing is removed, so the
          // grid keeps its shape and the eye only has to follow the light.
          const filtering = kind !== "all";
          card.classList.toggle("match", filtering && hit);
          card.classList.toggle("dim", filtering && !hit);
        });
      });
    });

    const tabs = document.querySelectorAll('[role="tab"][data-cmd]');
    const cmds = document.querySelectorAll('.install-cmds code[data-cmd]');
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
        cmds.forEach((c) => { c.hidden = c.dataset.cmd !== tab.dataset.cmd; });
      });
    });

    document.getElementById("copy-url")?.addEventListener("click", (e) => {
      const btn = e.currentTarget;
      navigator.clipboard?.writeText(document.getElementById("mcp-url").textContent.trim());
      const lang = document.documentElement.lang === "en" ? "en" : "pt";
      btn.textContent = lang === "en" ? "Copied" : "Copiado";
      setTimeout(() => { btn.textContent = lang === "en" ? btn.dataset.en : btn.dataset.pt; }, 1500);
    });

    document.getElementById("copy-btn")?.addEventListener("click", (e) => {
      const code = document.querySelector('.install-cmds code[data-cmd]:not([hidden])');
      if (!code) return;
      const btn = e.currentTarget;
      navigator.clipboard?.writeText(code.textContent.trim());
      const lang = document.documentElement.lang === "en" ? "en" : "pt";
      btn.textContent = lang === "en" ? "Copied" : "Copiado";
      setTimeout(() => { btn.textContent = lang === "en" ? btn.dataset.en : btn.dataset.pt; }, 1500);
    });
  </script>
</body>
</html>`;
}

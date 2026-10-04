# -*- coding: utf-8 -*-
"""Reorganise the projects section: headline, status, faceted filters, and a
mono meta line in place of the chip wall."""
import collections
import io
import json

# ---------------------------------------------------------------- profile
CATEGORIES = {
    "mcp-perfil": "IA & agentes",
    "test-quality-judge": "IA & agentes",
    "llm-eval-engineering": "IA & agentes",
    "QE-agents-workflow": "IA & agentes",
    "QA-memory": "IA & agentes",
    "playwright-test-kit": "Automação de testes",
    "E2E-ecommerce-validation-framework": "Automação de testes",
    "e2e-ecommerce-playwright": "Automação de testes",
    "Streaming-typescript-playwright": "Automação de testes",
    "E2E-Quality-Pipeline": "Automação de testes",
    "ci-reliability-toolkit": "CI & confiabilidade",
    "Appium-Robot-Study": "Testes mobile",
}
IN_PROGRESS = {"mcp-perfil"}

prof = json.load(io.open("profile.json", encoding="utf-8"), object_pairs_hook=collections.OrderedDict)
for proj in prof["projetos"]:
    proj["categoria"] = CATEGORIES.get(proj["nome"], "Outros")
    proj["status"] = "em andamento" if proj["nome"] in IN_PROGRESS else "pronto"

# the QA-memory blurb still described the pre-pivot MCP+SQLite architecture
for proj in prof["projetos"]:
    if proj["nome"] == "QA-memory":
        proj["descricao"] = (
            "Base de conhecimento de QA em markdown versionado, lida pelo assistente de IA. "
            "Sem servidor, sem banco e sem chave de LLM: cada comportamento do produto vira um "
            "arquivo com suas regras, ligado por wikilinks a áreas e incidentes. O conhecimento "
            "acumula em vez de evaporar na rotatividade, e os dados sensíveis nunca saem da máquina."
        )
        proj["tecnologias"] = ["Markdown", "Git", "Claude Code", "RAG", "Knowledge graph"]
json.dump(prof, io.open("profile.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)

# ---------------------------------------------------------------- i18n
p = "src/i18n.js"
s = io.open(p, encoding="utf-8").read()
s = s.replace(
    "  toolsLabel: [",
    """  projectsHeadline: ["Entregues e em andamento", "Shipped and in progress"],
  filterAll: ["Todos", "All"],
  statusReady: ["pronto", "Ready"],
  statusProgress: ["em andamento", "In progress"],
  toolsLabel: [""",
    1,
)
s = s.replace(
    "const LOCATIONS = {",
    """const CATEGORIES = {
  "IA & agentes": "AI & agents",
  "Automação de testes": "Test automation",
  "CI & confiabilidade": "CI & reliability",
  "Testes mobile": "Mobile testing",
  "Outros": "Other",
  "pronto": "Ready",
  "em andamento": "In progress",
};

const LOCATIONS = {""",
    1,
)
s = s.replace(
    "const ALL = { ...ROLES, ...PROJECTS,",
    "const ALL = { ...ROLES, ...CATEGORIES, ...PROJECTS,",
    1,
)
# the new QA-memory blurb needs its English pair
s = s.replace(
    "const RECOMMENDATIONS = {",
    '''const QA_MEMORY_PT = "Base de conhecimento de QA em markdown versionado, lida pelo assistente de IA. Sem servidor, sem banco e sem chave de LLM: cada comportamento do produto vira um arquivo com suas regras, ligado por wikilinks a áreas e incidentes. O conhecimento acumula em vez de evaporar na rotatividade, e os dados sensíveis nunca saem da máquina.";
const QA_MEMORY_EN = "A QA knowledge base in version-controlled markdown, read by the AI assistant. No server, no database, no LLM key: each product behaviour becomes a file holding its rules, wikilinked to areas and incidents. Knowledge accumulates instead of evaporating with turnover, and sensitive data never leaves the machine.";

const RECOMMENDATIONS = {''',
    1,
)
s = s.replace("const ALL = {", "PROJECTS[QA_MEMORY_PT] = QA_MEMORY_EN;\n\nconst ALL = {", 1)
io.open(p, "w", encoding="utf-8").write(s)

# ---------------------------------------------------------------- page
p = "src/landing-page.js"
s = io.open(p, encoding="utf-8").read()


def swap(old, new, label):
    global s
    assert old in s, "missing: " + label
    s = s.replace(old, new, 1)


swap(
    '''function renderProjCard(proj, i, live) {
  const n = String(i + 1).padStart(2, "0");
  const repo = live?.get(proj.nome);
  let meta = "";
  if (repo) {
    const partsPt = [];
    const partsEn = [];
    if (repo.linguagem_principal) {
      partsPt.push(repo.linguagem_principal);
      partsEn.push(repo.linguagem_principal);
    }
    if (repo.estrelas > 0) {
      partsPt.push(`${repo.estrelas}★`);
      partsEn.push(`${repo.estrelas}★`);
    }
    const aPt = ago(repo.atualizado_em, "pt");
    const aEn = ago(repo.atualizado_em, "en");
    if (aPt) { partsPt.push(aPt); partsEn.push(aEn); }
    if (partsPt.length) {
      const ptStr = partsPt.join(" · ");
      const enStr = partsEn.join(" · ");
      meta = `<span class="repo-meta" ${bi(ptStr, enStr)}>${esc(enStr)}</span>`;
    }
  }
  return `
    <a class="pui-card card-link reveal" href="${esc(proj.link)}" target="_blank" rel="noopener">
      <div class="pui-card-content">
        <div class="card-title-row">
          <span class="card-name">${esc(proj.nome)}</span>
          <span class="chip-n">${n}</span>
        </div>
        <p class="muted" ${bi(proj.descricao)}>${esc(en(proj.descricao))}</p>
        <div class="chip-row">${(proj.tecnologias || []).map((x) => `<span class="pui-chip pui-outline pui-surface">${esc(x)}</span>`).join("")}</div>
        ${meta}
      </div>
    </a>`;
}''',
    '''function renderProjCard(proj, live) {
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
       data-status="${esc(statusPt)}" data-tech="${esc((proj.tecnologias || []).join("|"))}">
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

/** Status and technology facets, each carrying its own count. */
function renderFacets(projetos) {
  const counts = new Map();
  for (const p of projetos) {
    for (const t of p.tecnologias || []) counts.set(t, (counts.get(t) || 0) + 1);
  }
  const ready = projetos.filter((p) => (p.status || "pronto") === "pronto").length;
  const wip = projetos.length - ready;

  const chip = (key, ptLabel, enLabel, count, active) =>
    `<button type="button" class="facet${active ? " is-active" : ""}" data-facet="${esc(key)}">` +
    `<span ${bi(ptLabel, enLabel)}>${esc(enLabel)}</span><span class="facet-n">${count}</span></button>`;

  const out = [chip("all", ui("filterAll")[0], ui("filterAll")[1], projetos.length, true)];
  if (ready) out.push(chip("status:pronto", "pronto", "Ready", ready, false));
  if (wip) out.push(chip("status:em andamento", "em andamento", "In progress", wip, false));
  for (const [tech, n] of [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
    out.push(chip("tech:" + tech, tech, tech, n, false));
  }
  return out.join("");
}''',
    "project card",
)

swap(
    '  const projCards = projetos.map((p, i) => renderProjCard(p, i, live)).join("");',
    '  const projCards = projetos.map((p) => renderProjCard(p, live)).join("");\n  const projFacets = renderFacets(projetos);',
    "project cards call",
)

swap(
    '''    <section class="cell" style="padding: 56px var(--gutter) 0;" id="projetos">
      <span class="index">${uiText("idxProjects")}</span>
    </section>
    <div class="human"><div class="grid3">${projCards}</div></div>''',
    '''    <section class="cell" style="padding: 56px var(--gutter) 0;" id="projetos">
      <span class="index">${uiText("idxProjects")}</span>
      <h2 class="section-title">${uiText("projectsHeadline")}</h2>
      <div class="facets">${projFacets}</div>
    </section>
    <div class="human"><div class="grid3">${projCards}</div></div>''',
    "projects header",
)

# ---- CSS ----
swap(
    "  .chip-n { font-family: var(--font-mono); opacity: 0.6; font-size: 11px; font-variant-numeric: tabular-nums; }",
    """  .chip-n { font-family: var(--font-mono); opacity: 0.6; font-size: 11px; font-variant-numeric: tabular-nums; }

  .section-title { font-size: clamp(1.6rem, 2.6vw, 2.1rem); margin: 0 0 22px; }
  .facets { display: flex; flex-wrap: wrap; gap: 7px; padding-bottom: 36px; }
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
    background: var(--bg-muted); border: 1px solid var(--border);
    border-radius: calc(var(--radius) * 1.5); padding: 20px;
    color: inherit; text-decoration: none;
    transition: border-color 0.15s;
  }
  .proj-card:hover { border-color: var(--text-muted); }
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
  .proj-foot .repo-meta { border: 0; padding: 0; margin: 0; }""",
    "project css",
)

# ---- filtering behaviour ----
swap(
    "    const tabs = document.querySelectorAll('[role=\"tab\"][data-cmd]');",
    """    const facets = document.querySelectorAll(".facet");
    const cards = document.querySelectorAll(".proj-card");
    facets.forEach((f) => {
      f.addEventListener("click", () => {
        facets.forEach((x) => x.classList.toggle("is-active", x === f));
        const key = f.dataset.facet;
        const [kind, value] = key === "all" ? ["all"] : [key.slice(0, key.indexOf(":")), key.slice(key.indexOf(":") + 1)];
        cards.forEach((card) => {
          let show = true;
          if (kind === "status") show = card.dataset.status === value;
          else if (kind === "tech") show = (card.dataset.tech || "").split("|").includes(value);
          card.hidden = !show;
        });
      });
    });

    const tabs = document.querySelectorAll('[role="tab"][data-cmd]');""",
    "facet behaviour",
)

io.open(p, "w", encoding="utf-8").write(s)
print("projects section reorganised")

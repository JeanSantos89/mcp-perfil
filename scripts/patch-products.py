# -*- coding: utf-8 -*-
"""Add a Products section built from real, countable assets in the repos."""
import collections
import io
import json

# ------------------------------------------------- profile: fix stale counts
prof = json.load(io.open("profile.json", encoding="utf-8"), object_pairs_hook=collections.OrderedDict)
for proj in prof["projetos"]:
    if proj["nome"] == "QE-agents-workflow":
        # README now says four skills and six subagents, not one and seven.
        proj["descricao"] = (
            "A quality engineering workflow built entirely as agent configuration: one slash "
            "command, four skills, and six subagents that carry a ticket from links to product "
            "review. Refuses to invent context, refuses to claim an unverified pass, and stops "
            "for every human decision. Companion to QA-memory."
        )

# the three flagship products, each with one headline figure
PRODUCTS = [
    collections.OrderedDict([
        ("nome", "QA-memory"),
        ("link", "https://github.com/JeanSantos89/QA-memory"),
        ("resumo", "Conhecimento de produto em markdown versionado, consultado pelo assistente durante o trabalho real. Sem servidor, sem banco, sem chave de LLM."),
        ("valor", 409),
        ("rotulo", "regras de negócio codificadas"),
        ("secundario", "116 comportamentos mapeados, 69 deles P0/P1"),
    ]),
    collections.OrderedDict([
        ("nome", "QE-agents-workflow"),
        ("link", "https://github.com/JeanSantos89/QE-agents-workflow"),
        ("resumo", "Um fluxo de engenharia de qualidade escrito inteiramente como configuração de agente, que leva um ticket dos links até a revisão de produto."),
        ("valor", 6),
        ("rotulo", "subagentes em produção"),
        ("secundario", "4 skills, 1 slash command e 3 paradas obrigatórias para decisão humana"),
    ]),
    collections.OrderedDict([
        ("nome", "Toolkits de confiabilidade"),
        ("link", "https://github.com/JeanSantos89/ci-reliability-toolkit"),
        ("resumo", "Ferramentas pequenas e independentes para o mesmo problema: teste e pipeline que passam sem provar nada."),
        ("valor", 11),
        ("rotulo", "ferramentas autônomas publicadas"),
        ("secundario", "7 em ci-reliability-toolkit, 4 em playwright-test-kit"),
    ]),
]
prof["produtos"] = PRODUCTS
json.dump(prof, io.open("profile.json", "w", encoding="utf-8"), ensure_ascii=False, indent=2)

# ------------------------------------------------------------------- i18n
p = "src/i18n.js"
s = io.open(p, encoding="utf-8").read()
s = s.replace(
    "  idxSkills: [",
    """  idxProducts: ["03 · Construído por mim", "03 · Built by me"],
  productsHeadline: ["Ferramentas que eu mantenho", "Tools I build and maintain"],
  idxSkills: [""",
    1,
)
# renumber the sections that come after
s = s.replace('  idxSkills: ["03 · Habilidades", "03 · Skills"],', '  idxSkills: ["04 · Habilidades", "04 · Skills"],')
s = s.replace('  idxTrajectory: ["04 · Trajetória", "04 · Trajectory"],', '  idxTrajectory: ["05 · Trajetória", "05 · Trajectory"],')
s = s.replace('  idxProjects: ["05 · Projetos", "05 · Projects"],', '  idxProjects: ["06 · Projetos", "06 · Projects"],')
s = s.replace('  idxRecs: ["06 · Recomendações", "06 · Recommendations"],', '  idxRecs: ["07 · Recomendações", "07 · Recommendations"],')
s = s.replace('  idxAgents: ["07 · Para agentes", "07 · For agents"],', '  idxAgents: ["08 · Para agentes", "08 · For agents"],')

PRODUCT_EN = {
    "Conhecimento de produto em markdown versionado, consultado pelo assistente durante o trabalho real. Sem servidor, sem banco, sem chave de LLM.":
        "Product knowledge in version-controlled markdown, consulted by the assistant during real work. No server, no database, no LLM key.",
    "regras de negócio codificadas": "business rules encoded",
    "116 comportamentos mapeados, 69 deles P0/P1": "116 behaviours mapped, 69 of them P0/P1",
    "Um fluxo de engenharia de qualidade escrito inteiramente como configuração de agente, que leva um ticket dos links até a revisão de produto.":
        "A quality engineering workflow written entirely as agent configuration, carrying a ticket from the links to product review.",
    "subagentes em produção": "subagents in production",
    "4 skills, 1 slash command e 3 paradas obrigatórias para decisão humana":
        "4 skills, 1 slash command and 3 mandatory stops for human decisions",
    "Ferramentas pequenas e independentes para o mesmo problema: teste e pipeline que passam sem provar nada.":
        "Small, independent tools for one recurring problem: tests and pipelines that pass without proving anything.",
    "ferramentas autônomas publicadas": "standalone tools published",
    "7 em ci-reliability-toolkit, 4 em playwright-test-kit": "7 in ci-reliability-toolkit, 4 in playwright-test-kit",
    "Toolkits de confiabilidade": "Reliability toolkits",
}
lines = ["", "const PRODUCTS_COPY = {"]
for k, v in PRODUCT_EN.items():
    lines.append('  "%s":' % k.replace('"', '\\"'))
    lines.append('    "%s",' % v.replace('"', '\\"'))
lines.append("};")
s = s.replace("const LOCATIONS = {", "\n".join(lines) + "\n\nconst LOCATIONS = {", 1)
s = s.replace("const ALL = { ...ROLES,", "const ALL = { ...ROLES, ...PRODUCTS_COPY,", 1)
io.open(p, "w", encoding="utf-8").write(s)

# ------------------------------------------------------------------- page
p = "src/landing-page.js"
s = io.open(p, encoding="utf-8").read()


def swap(old, new, label):
    global s
    assert old in s, "missing: " + label
    s = s.replace(old, new, 1)


swap(
    "function renderRecCard(rec) {",
    """function renderProduct(pr) {
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

function renderRecCard(rec) {""",
    "product renderer",
)

swap(
    "  const projFacets = renderFacets(projetos);",
    """  const projFacets = renderFacets(projetos);
  const produtos = profile.produtos || [];
  const productCards = produtos.map(renderProduct).join("");
  const productsAgentPt = ["products:", ...produtos.map((x) => `- ${x.nome}: ${x.valor} ${x.rotulo} (${x.secundario})`)];
  const productsAgentEn = ["products:", ...produtos.map((x) => `- ${x.nome}: ${x.valor} ${en(x.rotulo)} (${en(x.secundario)})`)];""",
    "products data",
)

swap(
    '''    <section class="cell" style="padding: 56px var(--gutter) 0;">
      <span class="index">${uiText("idxSkills")}</span>
    </section>''',
    '''    <section class="cell" style="padding: 56px var(--gutter) 0;">
      <span class="index">${uiText("idxProducts")}</span>
      <h2 class="section-title">${uiText("productsHeadline")}</h2>
    </section>
    <div class="human"><div class="products">${productCards}</div></div>
    ${agentBlock(productsAgentPt, productsAgentEn)}

    <section class="cell" style="padding: 56px var(--gutter) 0;">
      <span class="index">${uiText("idxSkills")}</span>
    </section>''',
    "products section",
)

swap(
    "  .section-title { font-size: clamp(1.6rem, 2.6vw, 2.1rem); margin: 0 0 22px; }",
    """  .section-title { font-size: clamp(1.6rem, 2.6vw, 2.1rem); margin: 0 0 22px; }

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
  .product:hover { background: var(--bg-muted); }
  .product-name { font-family: var(--font-mono); font-size: 17px; font-weight: 600; }
  .product-lead { margin: 12px 0 0; font-size: 13.5px; line-height: 1.6; color: var(--text-muted); max-width: 42ch; }
  .product-figure { margin-top: auto; padding-top: 28px; display: flex; align-items: baseline; gap: 12px; }
  .product-figure .num { font-size: clamp(2.6rem, 4vw, 3.4rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1; font-variant-numeric: tabular-nums; }
  .product-label { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); max-width: 16ch; line-height: 1.4; }
  .product-sub { margin: 14px 0 0; padding-top: 14px; border-top: 1px solid var(--border); font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }""",
    "products css",
)

io.open(p, "w", encoding="utf-8").write(s)
print("products section added")

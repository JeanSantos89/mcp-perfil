function esc(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function renderSkillGroup(titulo, itens) {
  if (!itens?.length) return "";
  return `
    <div class="skill-group">
      <h3>${esc(titulo)}</h3>
      <div class="tags">${itens.map((i) => `<span class="tag">${esc(i)}</span>`).join("")}</div>
    </div>`;
}

function renderExperiencia(exp) {
  return `
    <article class="card">
      <div class="card-head">
        <h3>${esc(exp.cargo)}</h3>
        <span class="period">${esc(exp.inicio)} — ${esc(exp.fim)}</span>
      </div>
      <p class="company">${esc(exp.empresa)}</p>
      <div class="tags">${(exp.tecnologias || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
    </article>`;
}

function renderProjeto(proj) {
  return `
    <a class="card project" href="${esc(proj.link)}" target="_blank" rel="noopener">
      <h3>${esc(proj.nome)}</h3>
      <p>${esc(proj.descricao)}</p>
      <div class="tags">${(proj.tecnologias || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
    </a>`;
}

export function renderLandingPage(profile) {
  const skillLabels = {
    ia_aplicada_qa: "IA aplicada a QA",
    automacao_de_testes: "Automação de testes",
    linguagens: "Linguagens",
    backend_apis: "Backend & APIs",
    cicd_observabilidade: "CI/CD & Observabilidade",
    outras: "Outras",
  };

  const skillsHtml = Object.entries(profile.habilidades || {})
    .map(([key, itens]) => renderSkillGroup(skillLabels[key] || key, itens))
    .join("");

  const expHtml = (profile.experiencias || []).map(renderExperiencia).join("");
  const projHtml = (profile.projetos || []).map(renderProjeto).join("");

  return `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(profile.nome_exibicao || profile.nome)} — ${esc(profile.titulo)}</title>
<meta name="description" content="${esc(profile.resumo_curto || "")}">
<style>
  :root {
    --bg: #0b0d12;
    --surface: #12151c;
    --surface-2: #171b24;
    --border: #262b36;
    --text: #e8eaed;
    --text-dim: #9aa1ae;
    --accent: #7dd3fc;
    --accent-2: #a78bfa;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif;
    line-height: 1.55;
  }
  .wrap { max-width: 920px; margin: 0 auto; padding: 48px 24px 96px; }
  header.hero { margin-bottom: 56px; }
  .hero h1 { font-size: 2rem; margin: 0 0 4px; }
  .hero .subtitle { color: var(--accent); font-size: 1.05rem; margin: 0 0 16px; }
  .hero .location { color: var(--text-dim); font-size: 0.9rem; margin: 0 0 20px; }
  .hero p.summary { color: var(--text-dim); max-width: 70ch; }
  .links { display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap; }
  .links a {
    color: var(--bg);
    background: var(--accent);
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 999px;
    font-size: 0.9rem;
    font-weight: 600;
  }
  .links a.secondary {
    background: transparent;
    color: var(--text);
    border: 1px solid var(--border);
  }
  section { margin-bottom: 48px; }
  section > h2 {
    font-size: 1.1rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-dim);
    border-bottom: 1px solid var(--border);
    padding-bottom: 10px;
    margin-bottom: 20px;
  }
  .grid { display: grid; gap: 16px; }
  .grid.two { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px 20px;
    display: block;
    color: inherit;
    text-decoration: none;
  }
  .card-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
  .card h3 { margin: 0 0 4px; font-size: 1.02rem; }
  .card .period { color: var(--text-dim); font-size: 0.82rem; white-space: nowrap; }
  .card .company { color: var(--accent-2); margin: 0 0 10px; font-size: 0.92rem; }
  .card p { color: var(--text-dim); font-size: 0.9rem; margin: 0 0 10px; }
  .card.project:hover { border-color: var(--accent); }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .tag {
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text-dim);
    font-size: 0.75rem;
    padding: 3px 10px;
    border-radius: 999px;
  }
  .skill-group { margin-bottom: 18px; }
  .skill-group h3 { font-size: 0.85rem; color: var(--text-dim); margin: 0 0 8px; font-weight: 600; }
  .mcp-note {
    background: var(--surface);
    border: 1px dashed var(--border);
    border-radius: 12px;
    padding: 16px 20px;
    font-size: 0.85rem;
    color: var(--text-dim);
  }
  .mcp-note code { color: var(--accent); }
  footer { color: var(--text-dim); font-size: 0.8rem; text-align: center; margin-top: 64px; }
</style>
</head>
<body>
  <div class="wrap">
    <header class="hero">
      <h1>${esc(profile.nome_exibicao || profile.nome)}</h1>
      <p class="subtitle">${esc(profile.titulo)}</p>
      <p class="location">${esc(profile.localizacao)}</p>
      <p class="summary">${esc(profile.resumo_curto)}</p>
      <div class="links">
        ${profile.contato?.linkedin ? `<a href="${esc(profile.contato.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : ""}
        ${profile.contato?.github ? `<a class="secondary" href="${esc(profile.contato.github)}" target="_blank" rel="noopener">GitHub</a>` : ""}
      </div>
    </header>

    <section>
      <h2>Habilidades</h2>
      ${skillsHtml}
    </section>

    <section>
      <h2>Experiência</h2>
      <div class="grid">${expHtml}</div>
    </section>

    <section>
      <h2>Projetos</h2>
      <div class="grid two">${projHtml}</div>
    </section>

    <section>
      <h2>Sobre este site</h2>
      <p class="mcp-note">
        Esta página é servida por um <strong>servidor MCP (Model Context Protocol)</strong> que expõe
        meus dados profissionais como ferramentas consumíveis por agentes de IA.
        Endpoint MCP (Streamable HTTP): <code>/mcp</code>.
      </p>
    </section>

    <footer>${esc(profile.nome_exibicao || profile.nome)} · gerado a partir de profile.json</footer>
  </div>
</body>
</html>`;
}

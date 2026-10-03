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

function renderExperiencia(exp, i, total) {
  const isLast = i === total - 1;
  return `
    <li class="timeline-node${isLast ? " is-last" : ""}">
      <div class="node-mark"></div>
      <article class="card">
        <div class="card-head">
          <h3>${esc(exp.cargo)}</h3>
          <span class="period">${esc(exp.inicio)} — ${esc(exp.fim)}</span>
        </div>
        <p class="company">${esc(exp.empresa)}</p>
        <div class="tags">${(exp.tecnologias || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      </article>
    </li>`;
}

function renderProjeto(proj, i) {
  const corner = i % 3;
  return `
    <a class="card project corner-${corner}" href="${esc(proj.link)}" target="_blank" rel="noopener">
      <h3>${esc(proj.nome)}</h3>
      <p>${esc(proj.descricao)}</p>
      <div class="tags">${(proj.tecnologias || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
    </a>`;
}

const DIVIDER = `
<svg class="divider" viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true">
  <path d="M0 12 Q 50 2, 100 12 T 200 12 T 300 12 T 400 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`;

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

  const experiencias = profile.experiencias || [];
  const expHtml = experiencias
    .map((exp, i) => renderExperiencia(exp, i, experiencias.length))
    .join("");
  const projHtml = (profile.projetos || []).map(renderProjeto).join("");

  return `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(profile.nome_exibicao || profile.nome)} | Currículo &amp; MCP Server</title>
<meta name="description" content="${esc(profile.resumo_curto || "")}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,650;1,9..144,500&family=Work+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --canopy: #0f2016;
    --canopy-deep: #0a1810;
    --leaf-shadow: #1b3324;
    --leaf-shadow-2: #22402c;
    --vine: #5c8a5f;
    --sand: #f3ecd4;
    --sand-dim: #b9c9ae;
    --sun: #e3a944;
    --sun-soft: #f0c878;
    --copper: #bb6b3e;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0;
    background:
      radial-gradient(60rem 36rem at 15% -10%, rgba(227, 169, 68, 0.22), transparent 60%),
      radial-gradient(50rem 40rem at 100% 0%, rgba(92, 138, 95, 0.16), transparent 55%),
      var(--canopy);
    color: var(--sand);
    font-family: "Work Sans", -apple-system, "Segoe UI", sans-serif;
    line-height: 1.6;
  }
  .wrap { max-width: 880px; margin: 0 auto; padding: 72px 24px 100px; }

  header.hero { position: relative; padding-bottom: 40px; }
  .hero .ray {
    position: absolute;
    top: -60px; left: -40px;
    width: 260px; height: 260px;
    background: radial-gradient(circle, rgba(240, 200, 120, 0.35), transparent 70%);
    filter: blur(4px);
    z-index: 0;
    pointer-events: none;
  }
  .hero-inner { position: relative; z-index: 1; }
  .hero h1 {
    font-family: "Fraunces", serif;
    font-weight: 650;
    font-size: clamp(2.2rem, 5vw, 3.1rem);
    margin: 0 0 6px;
    color: var(--sand);
    letter-spacing: -0.01em;
  }
  .hero .subtitle {
    font-family: "Fraunces", serif;
    font-style: italic;
    font-weight: 500;
    color: var(--sun-soft);
    font-size: 1.2rem;
    margin: 0 0 14px;
    max-width: 50ch;
  }
  .hero .location {
    color: var(--sand-dim);
    font-size: 0.88rem;
    margin: 0 0 22px;
  }
  .hero .location::before { content: "🌱 "; }
  .hero p.summary { color: var(--sand-dim); max-width: 68ch; font-size: 0.98rem; }
  .links { display: flex; gap: 14px; margin-top: 24px; flex-wrap: wrap; }
  .links a {
    color: var(--canopy-deep);
    background: linear-gradient(135deg, var(--sun-soft), var(--sun));
    text-decoration: none;
    padding: 10px 22px;
    border-radius: 18px 6px 18px 6px;
    font-size: 0.92rem;
    font-weight: 600;
    box-shadow: 0 4px 14px rgba(227, 169, 68, 0.25);
  }
  .links a.secondary {
    background: transparent;
    color: var(--sand);
    border: 1px solid var(--vine);
    box-shadow: none;
  }

  .divider { display: block; width: 100%; height: 20px; color: var(--vine); opacity: 0.5; margin: 8px 0 44px; }

  section { margin-bottom: 44px; }
  section > h2 {
    font-family: "Fraunces", serif;
    font-weight: 600;
    font-size: 1.4rem;
    color: var(--sun-soft);
    margin: 0 0 24px;
  }

  .grid { display: grid; gap: 18px; }
  .grid.two { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }

  .card {
    background: linear-gradient(160deg, var(--leaf-shadow), var(--leaf-shadow-2));
    border: 1px solid rgba(92, 138, 95, 0.35);
    padding: 20px 22px;
    display: block;
    color: inherit;
    text-decoration: none;
  }
  .card.project { border-radius: 26px 8px 26px 8px; }
  .card.project.corner-1 { border-radius: 8px 26px 8px 26px; }
  .card.project.corner-2 { border-radius: 26px 26px 8px 8px; }
  .card.project:hover { border-color: var(--sun); }

  .card-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
  .card h3 { font-family: "Fraunces", serif; font-weight: 600; margin: 0 0 6px; font-size: 1.08rem; color: var(--sand); }
  .card .period { color: var(--sand-dim); font-size: 0.8rem; white-space: nowrap; }
  .card .company { color: var(--copper); margin: 0 0 12px; font-size: 0.92rem; font-weight: 500; }
  .card p { color: var(--sand-dim); font-size: 0.92rem; margin: 0 0 12px; }

  .tags { display: flex; flex-wrap: wrap; gap: 7px; }
  .tag {
    background: rgba(243, 236, 212, 0.06);
    border: 1px solid rgba(185, 201, 174, 0.3);
    color: var(--sand-dim);
    font-size: 0.74rem;
    padding: 4px 12px;
    border-radius: 999px;
  }

  .skill-group { margin-bottom: 20px; }
  .skill-group h3 { font-size: 0.86rem; color: var(--sun-soft); margin: 0 0 10px; font-weight: 600; }

  .timeline { list-style: none; margin: 0; padding: 0 0 0 20px; border-left: 2px solid var(--vine); }
  .timeline-node { position: relative; margin-bottom: 20px; padding-left: 22px; }
  .timeline-node.is-last { margin-bottom: 0; }
  .node-mark {
    position: absolute;
    left: -29px; top: 22px;
    width: 14px; height: 14px;
    background: var(--sun);
    border: 3px solid var(--canopy);
    border-radius: 50%;
    box-shadow: 0 0 0 2px var(--vine);
  }

  .mcp-note {
    background: var(--leaf-shadow);
    border: 1px dashed var(--vine);
    border-radius: 8px 26px 8px 26px;
    padding: 18px 22px;
    font-size: 0.88rem;
    color: var(--sand-dim);
  }
  .mcp-note code { color: var(--sun-soft); }

  footer { color: var(--sand-dim); opacity: 0.6; font-size: 0.8rem; text-align: center; margin-top: 72px; }

  @media (prefers-reduced-motion: no-preference) {
    .hero-inner { animation: rise 0.6s ease-out; }
    @keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  }
</style>
</head>
<body>
  <div class="wrap">
    <header class="hero">
      <div class="ray"></div>
      <div class="hero-inner">
        <h1>${esc(profile.nome_exibicao || profile.nome)}</h1>
        <p class="subtitle">${esc(profile.titulo)}</p>
        <p class="location">${esc(profile.localizacao)}</p>
        <p class="summary">${esc(profile.resumo_curto)}</p>
        <div class="links">
          ${profile.contato?.linkedin ? `<a href="${esc(profile.contato.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : ""}
          ${profile.contato?.github ? `<a class="secondary" href="${esc(profile.contato.github)}" target="_blank" rel="noopener">GitHub</a>` : ""}
        </div>
      </div>
    </header>

    ${DIVIDER}

    <section>
      <h2>Habilidades</h2>
      ${skillsHtml}
    </section>

    ${DIVIDER}

    <section>
      <h2>Experiência</h2>
      <ul class="timeline">${expHtml}</ul>
    </section>

    ${DIVIDER}

    <section>
      <h2>Projetos</h2>
      <div class="grid two">${projHtml}</div>
    </section>

    ${DIVIDER}

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

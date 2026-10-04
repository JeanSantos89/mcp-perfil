# -*- coding: utf-8 -*-
"""Rebuild the For agents block as a two-column call to action, and give the
footer the same three-link shape as the reference."""
import io

# ---------------------------------------------------------------- i18n
p = "src/i18n.js"
s = io.open(p, encoding="utf-8").read()
s = s.replace(
    "  toolsLabel: [",
    """  agentsHeadline: [
    "Conecte seu agente a este site",
    "Connect your agent to this site",
  ],
  agentsLead: [
    "O mesmo conteúdo que você está lendo sai daqui como ferramentas estruturadas: experiências, habilidades, projetos e repositórios do GitHub ao vivo.",
    "The same content you are reading ships from here as structured tools: experience, skills, projects and live GitHub repositories.",
  ],
  toolsLabel: [""",
    1,
)
io.open(p, "w", encoding="utf-8").write(s)

# ---------------------------------------------------------------- page
p = "src/landing-page.js"
s = io.open(p, encoding="utf-8").read()


def swap(old, new, label):
    global s
    assert old in s, "missing: " + label
    s = s.replace(old, new, 1)


swap(
    '''    <section class="cell pad agents-cell" id="agentes">
      <span class="index">${uiText("idxAgents")}</span>
      <p>${uiText("agentsBody")}</p>
      <code>POST https://jean-santos.onrender.com/mcp</code>
      <p class="tools-line">${uiText("toolsLabel")}</p>
      <div class="chip-row">${MCP_TOOLS.map((x) => `<span class="pui-chip pui-outline pui-surface">${esc(x)}</span>`).join("")}</div>
    </section>''',
    '''    <section class="cell pad agents-cell" id="agentes">
      <span class="tag">code[role=textbox] · .facet · .proj-link</span>
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
    </section>''',
    "agents section",
)

swap(
    """    <footer class="site-footer">
      <span>${esc(profile.nome_exibicao || profile.nome)}</span>
      <ul class="profiles">
        ${profile.contato?.linkedin ? `<li><a href="${esc(profile.contato.linkedin)}" target="_blank" rel="noopener">LinkedIn</a></li>` : ""}
        ${profile.contato?.github ? `<li><a href="${esc(profile.contato.github)}" target="_blank" rel="noopener">GitHub</a></li>` : ""}
      </ul>
    </footer>""",
    """    <footer class="site-footer">
      <ul class="profiles">
        ${profile.contato?.github ? `<li><a href="${esc(profile.contato.github)}" target="_blank" rel="noopener">GitHub ${esc(profile.github_usuario || "")}</a></li>` : ""}
        ${profile.contato?.linkedin ? `<li><a href="${esc(profile.contato.linkedin)}" target="_blank" rel="noopener">LinkedIn jean-santos72</a></li>` : ""}
        <li><a href="#agentes">MCP /mcp</a></li>
      </ul>
      <span>${esc(nome)}</span>
    </footer>""",
    "footer",
)

swap(
    """  .agents-cell code { display: block; font-family: var(--font-mono); font-size: 13px; background: var(--bg-muted); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; color: var(--theme); margin-top: 16px; overflow-x: auto; }
  .agents-cell p { max-width: 70ch; color: var(--text-muted); font-size: 15px; line-height: 1.65; }
  .agents-cell .tools-line { font-family: var(--font-mono); font-size: 12px; margin-top: 20px; margin-bottom: 10px; }""",
    """  .agents-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(28px, 5vw, 72px); align-items: start; padding-top: 18px; }
  @media (max-width: 860px) { .agents-grid { grid-template-columns: 1fr; } }
  .agents-lead { max-width: 46ch; color: var(--text-muted); font-size: 15px; line-height: 1.65; }
  .agents-actions { display: grid; gap: 18px; }
  .agents-actions .install-field { margin: 0; }
  .agents-actions code { color: var(--text); }
  .agents-tools { display: grid; gap: 10px; }
  .tools-label { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); }""",
    "agents css",
)

swap(
    """    document.getElementById("copy-btn")?.addEventListener("click", (e) => {""",
    """    document.getElementById("copy-url")?.addEventListener("click", (e) => {
      const btn = e.currentTarget;
      navigator.clipboard?.writeText(document.getElementById("mcp-url").textContent.trim());
      const lang = document.documentElement.lang === "en" ? "en" : "pt";
      btn.textContent = lang === "en" ? "Copied" : "Copiado";
      setTimeout(() => { btn.textContent = lang === "en" ? btn.dataset.en : btn.dataset.pt; }, 1500);
    });

    document.getElementById("copy-btn")?.addEventListener("click", (e) => {""",
    "copy url handler",
)

io.open(p, "w", encoding="utf-8").write(s)
print("agents section rebuilt")

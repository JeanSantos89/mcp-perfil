# -*- coding: utf-8 -*-
"""Drop the growth-ring motif, un-red the company chip, and offer more
MCP client snippets than just Claude Code and raw HTTP."""
import io
import re

# --- i18n: the ring caption has no home any more ---
p = "src/i18n.js"
s = io.open(p, encoding="utf-8").read()
s = re.sub(r"  ringNote: \[\n.*?\n.*?\n  \],\n", "", s, flags=re.S)
assert "ringNote" not in s, "ringNote survived"
io.open(p, "w", encoding="utf-8").write(s)

# --- page ---
p = "src/landing-page.js"
s = io.open(p, encoding="utf-8").read()


def drop(old, label, new=""):
    global s
    assert old in s, "missing: " + label
    s = s.replace(old, new, 1)


drop(
    """function renderRing(exp, i) {
  const radius = 26 + i * 15;
  const circumference = 2 * Math.PI * radius;
  return `<circle class="ring" cx="140" cy="140" r="${radius}" style="--c:${circumference}; --d:${i * 120}" />`;
}

""",
    "renderRing",
)

drop('  const rings = experiencias.slice(0, 5).map(renderRing).join("");\n', "rings const")

drop(
    """  .rings-svg { position: absolute; right: var(--gutter); bottom: 20px; width: 160px; height: auto; opacity: 0.18; pointer-events: none; }
  .ring { fill: none; stroke: var(--ember); stroke-width: 1.5; stroke-dasharray: var(--c); stroke-dashoffset: var(--c); transition: stroke-dashoffset 1.2s ease; transition-delay: calc(var(--d) * 1ms); }
  .timeline-wrap.in-view .ring { stroke-dashoffset: 0; }
""",
    "ring css",
)

drop('        <svg class="rings-svg" viewBox="0 0 280 280">${rings}</svg>\n', "ring svg")
drop('        <p class="ring-note">${uiText("ringNote")}</p>\n', "ring note")

s = re.sub(
    r"  \.ring-note \{[^}]*\}\n",
    "",
    s,
)

# the observer only existed to draw the rings
drop(
    """    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("in-view");
      });
    }, { threshold: 0.3 });
    document.querySelectorAll(".timeline-wrap").forEach((el) => io.observe(el));

""",
    "ring observer",
)

# --- company chip: keep the chip, drop the red fill ---
drop(
    '<span class="pui-chip" style="background:var(--inferno);color:var(--pearl);border-color:var(--inferno)">Cortex Geofusion</span>',
    "company chip",
    '<span class="pui-chip pui-outline pui-surface">Cortex Geofusion</span>',
)

# --- more ways to connect than Claude Code and curl ---
drop(
    """          <div role="tablist" aria-label="MCP">
            <button type="button" role="tab" aria-selected="true" data-cmd="claude">claude code</button>
            <button type="button" role="tab" aria-selected="false" data-cmd="http">http</button>
          </div>
          <div class="install-field">
            <div class="install-cmds">
              <code data-cmd="claude">claude mcp add perfil https://jean-santos.onrender.com/mcp</code>
              <code data-cmd="http" hidden>curl -X POST https://jean-santos.onrender.com/mcp</code>
            </div>""",
    "install tabs",
    """          <div role="tablist" aria-label="MCP">
            ${MCP_CLIENTS.map((c, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-cmd="${esc(c.id)}">${esc(c.label)}</button>`).join("")}
          </div>
          <div class="install-field">
            <div class="install-cmds">
              ${MCP_CLIENTS.map((c, i) => `<code data-cmd="${esc(c.id)}"${i === 0 ? "" : " hidden"}>${esc(c.cmd)}</code>`).join("")}
            </div>""",
)

drop(
    """  const MCP_TOOLS = [""",
    "clients const",
    """  const MCP_CLIENTS = [
    { id: "claude", label: "claude code", cmd: `claude mcp add --transport http perfil ${MCP_URL}` },
    { id: "cursor", label: "cursor", cmd: `{ "mcpServers": { "perfil": { "url": "${MCP_URL}" } } }` },
    { id: "vscode", label: "vs code", cmd: `{ "servers": { "perfil": { "type": "http", "url": "${MCP_URL}" } } }` },
    { id: "curl", label: "curl", cmd: `curl -X POST ${MCP_URL} -H "Content-Type: application/json"` },
  ];
  const MCP_TOOLS = [""",
)

io.open(p, "w", encoding="utf-8").write(s)
print("rings removed, chip neutral, clients expanded")

# -*- coding: utf-8 -*-
"""One-off patch: render delivery bullets, prose skills, percent stats,
scroll reveals, and bump the dot opacity."""
import io

p = "src/landing-page.js"
s = io.open(p, encoding="utf-8").read()


def swap(old, new, label):
    global s
    assert old in s, "missing: " + label
    s = s.replace(old, new, 1)


# 1) import the new tables
swap(
    'import { UI, SKILL_LABELS, en } from "./i18n.js";',
    'import { UI, SKILL_LABELS, SKILL_COPY, en } from "./i18n.js";',
    "import",
)

# 2) skills: a capability statement instead of a chip wall
swap(
    '''function renderSkillCell(key, itens) {
  if (!itens?.length) return "";
  const [pt, e] = SKILL_LABELS[key] || [key, key];
  return `
    <div class="skill-cell">
      <h3 ${bi(pt, e)}>${esc(e)}</h3>
      <div class="chip-row">${itens.map((i) => `<span class="pui-chip pui-outline pui-surface">${esc(i)}</span>`).join("")}</div>
    </div>`;
}''',
    '''function renderSkillCell(key, itens) {
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
}''',
    "skill cell",
)

# 3) experience: show what was built and delivered, not a stack chip row
swap(
    '''function renderExpEntry(exp) {
  const periodPt = `${exp.inicio} — ${exp.fim}`;
  const periodEn = `${en(exp.inicio)} — ${en(exp.fim)}`;
  return `
    <li class="checkpoint">
      <span class="checkpoint-dot"></span>
      <div class="checkpoint-body">
        <div class="head-row">
          <h3 ${bi(exp.cargo)}>${esc(en(exp.cargo))}</h3>
          <span class="meta" ${bi(periodPt, periodEn)}>${esc(periodEn)}</span>
        </div>
        <p class="muted company">${esc(exp.empresa)}</p>
        <div class="chip-row">${(exp.tecnologias || []).map((x) => `<span class="pui-chip pui-outline pui-surface">${esc(x)}</span>`).join("")}</div>
      </div>
    </li>`;
}''',
    '''/** Pulls the "- " highlights out of a profile description. */
function highlights(desc = "") {
  return desc
    .split("\\n")
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
}''',
    "experience entry",
)

# 4) stats: support a non-muted percent sign
swap(
    '''function stat(value, key, suffix = "") {
  const [pt, e] = ui(key);
  return `
    <div class="stat">
      <span class="stat-value"><span class="num" data-count="${value}">0</span>${suffix ? `<span class="muted">${esc(suffix)}</span>` : ""}</span>
      <span class="stat-label" ${bi(pt, e)}>${esc(e)}</span>
    </div>`;
}''',
    '''function stat(value, key, suffix = "") {
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
}''',
    "stat",
)

# 5) the four figures themselves
swap(
    '''        ${stat(409, "statRules")}
        ${stat(61, "statSpecs")}
        ${stat(10, "statRegression", "min")}
        ${stat(170, "statScenarios")}''',
    '''        ${stat(409, "statRules")}
        ${stat(98, "statRegression", "%")}
        ${stat(92, "statCoverage", "%")}
        ${stat(30, "statHeartbeat", "min")}''',
    "stat row",
)

swap(
    '''  const statRows = [
    [409, "statRules", ""],
    [61, "statSpecs", ""],
    [10, "statRegression", "min"],
    [170, "statScenarios", ""],
  ];''',
    '''  const statRows = [
    [409, "statRules", ""],
    [98, "statRegression", "%"],
    [92, "statCoverage", "%"],
    [30, "statHeartbeat", "min"],
  ];''',
    "stat rows",
)

# 6) reveal-on-scroll for cards
swap(
    '    <a class="pui-card card-link" href="${esc(proj.link)}"',
    '    <a class="pui-card card-link reveal" href="${esc(proj.link)}"',
    "project reveal",
)
swap('    <blockquote class="pui-card">', '    <blockquote class="pui-card reveal">', "rec reveal")

# 7) CSS: delivered list, skill copy, percent, reveal
swap(
    "  .checkpoint-body .company { font-size: 14px; margin: 4px 0 10px; }",
    """  .checkpoint-body .company { font-size: 14px; margin: 4px 0 12px; }
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
  }""",
    "css",
)

# 8) dots 20% brighter
swap("      const ALPHA_OPEN = 0.5;", "      const ALPHA_OPEN = 0.6;", "alpha open")
swap("      const ALPHA_TEXT = 0.14;", "      const ALPHA_TEXT = 0.17;", "alpha text")

# 9) observer that adds .in
swap(
    '''    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("in-view");
      });
    }, { threshold: 0.3 });
    document.querySelectorAll(".timeline-wrap").forEach((el) => io.observe(el));''',
    '''    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("in-view");
      });
    }, { threshold: 0.3 });
    document.querySelectorAll(".timeline-wrap").forEach((el) => io.observe(el));

    // Stagger each group so a section resolves in sequence, not all at once.
    const revealIo = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const siblings = [...(el.parentElement?.children || [])].filter((n) => n.classList.contains("reveal"));
        el.style.transitionDelay = Math.min(siblings.indexOf(el), 6) * 60 + "ms";
        el.classList.add("in");
        obs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".reveal").forEach((el) => revealIo.observe(el));''',
    "reveal observer",
)

io.open(p, "w", encoding="utf-8").write(s)
print("page patched")

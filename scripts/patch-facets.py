# -*- coding: utf-8 -*-
"""Trim the project filters: status, then category, then only the
technologies that actually group more than a couple of projects."""
import io

p = "src/landing-page.js"
s = io.open(p, encoding="utf-8").read()


def swap(old, new, label):
    global s
    assert old in s, "missing: " + label
    s = s.replace(old, new, 1)


swap(
    '''/** Status and technology facets, each carrying its own count. */
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
    '''/** Project filters, in three bands: status, category, then the handful of
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

  return bands.map((b) => `<div class="facet-band">${b}</div>`).join("");
}''',
    "facets",
)

# cards need the category for filtering
swap(
    '       data-status="${esc(statusPt)}" data-tech="${esc((proj.tecnologias || []).join("|"))}">',
    '       data-status="${esc(statusPt)}" data-cat="${esc(catPt)}" data-tech="${esc((proj.tecnologias || []).join("|"))}">',
    "card data attrs",
)

swap(
    '''          if (kind === "status") show = card.dataset.status === value;
          else if (kind === "tech") show = (card.dataset.tech || "").split("|").includes(value);''',
    '''          if (kind === "status") show = card.dataset.status === value;
          else if (kind === "cat") show = card.dataset.cat === value;
          else if (kind === "tech") show = (card.dataset.tech || "").split("|").includes(value);''',
    "filter logic",
)

swap(
    "  .facets { display: flex; flex-wrap: wrap; gap: 7px; padding-bottom: 36px; }",
    """  .facets { display: flex; flex-wrap: wrap; align-items: center; gap: 7px 14px; padding-bottom: 36px; }
  .facet-band { display: flex; flex-wrap: wrap; gap: 7px; }
  /* A hairline keeps the three bands readable as separate questions. */
  .facet-band + .facet-band { padding-left: 14px; border-left: 1px solid var(--border); }
  @media (max-width: 760px) {
    .facet-band + .facet-band { padding-left: 0; border-left: 0; }
  }""",
    "facet css",
)

io.open(p, "w", encoding="utf-8").write(s)
print("facets reorganised")

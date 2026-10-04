import PDFDocument from "pdfkit";
import { SKILL_LABELS, en } from "./i18n.js";

/** Pulls the "- " highlights out of a profile description, same format
 *  used by the landing page's experience timeline. */
function highlights(desc = "") {
  return desc
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2));
}

const HEADINGS = {
  summary: ["Resumo", "Summary"],
  experience: ["Experiência", "Experience"],
  education: ["Formação", "Education"],
  certifications: ["Certificações", "Certifications"],
  skills: ["Competências", "Skills"],
};

/** Download filename for the resume, per language. Extracted so tests can
 *  pin the PT/EN naming without spinning up the HTTP server. */
export function resumeFilename(profile, lang = "pt") {
  const nome = profile.nome_exibicao || profile.nome || "Resume";
  const suffix = lang === "en" ? "Resume" : "Curriculo";
  return `${nome} - ${suffix}`.replace(/[\\/:*?"<>|]/g, "");
}

const ACCENT = "#8a2c1f";
const MUTED = "#5a5a5a";
const TEXT = "#1a1a1a";
const RULE = "#d8d8d8";

/** Streams a resume PDF built live from profile.json into `res`, in
 *  Portuguese (default) or English. Nothing is pre-rendered or cached:
 *  every request walks the same data the MCP tools and the landing page
 *  read from, through the same PT->EN dictionary the page uses.
 *
 *  Every block below renders top-to-bottom with no explicit x/y: pdfkit's
 *  cursor sticks to whatever x the last positioned call used, so mixing in
 *  absolute coordinates (e.g. for a right-aligned date) drags every call
 *  after it off the left margin. Simple vertical flow avoids that trap. */
export function streamResumePdf(profile, res, lang = "pt") {
  const isEn = lang === "en";
  const tr = (s) => (isEn ? en(s) : s);
  const label = (key) => HEADINGS[key][isEn ? 1 : 0];

  const nome = profile.nome_exibicao || profile.nome;
  const doc = new PDFDocument({ size: "A4", margins: { top: 50, bottom: 50, left: 56, right: 56 } });
  doc.pipe(res);

  function heading(text) {
    doc.moveDown(0.9);
    doc.font("Helvetica-Bold").fontSize(10.5).fillColor(ACCENT)
      .text(text.toUpperCase(), { characterSpacing: 1 });
    const y = doc.y + 2;
    doc.moveTo(doc.page.margins.left, y)
      .lineTo(doc.page.width - doc.page.margins.right, y)
      .strokeColor(RULE).lineWidth(1).stroke();
    doc.moveDown(0.6);
  }

  function entryHead(title, period) {
    doc.font("Helvetica-Bold").fontSize(11).fillColor(TEXT).text(title);
    if (period) {
      doc.font("Helvetica").fontSize(8.5).fillColor(MUTED).text(period);
    }
  }

  function period(p) {
    const start = isEn ? en(p.inicio) : p.inicio;
    const end = p.fim === "o momento" ? tr("o momento") : (isEn ? en(p.fim) : p.fim);
    return `${start} – ${end}`;
  }

  // Header
  doc.font("Helvetica-Bold").fontSize(22).fillColor(TEXT).text(nome);
  doc.font("Helvetica").fontSize(12).fillColor(MUTED).text(tr(profile.titulo) || "");
  doc.moveDown(0.3);
  const idiomaLabel = (nivel) => tr(nivel);
  const idiomas = (profile.idiomas || [])
    .map((i) => `${isEn ? en(i.idioma) : i.idioma} (${idiomaLabel(i.nivel)})`)
    .join(" · ");
  const contactParts = [
    tr(profile.localizacao),
    "jeansaantos89@gmail.com",
    profile.contato?.linkedin?.replace(/^https?:\/\//, ""),
    profile.contato?.github?.replace(/^https?:\/\//, ""),
    profile.contato?.site?.replace(/^https?:\/\//, ""),
    idiomas,
  ].filter(Boolean);
  doc.font("Helvetica").fontSize(9.5).fillColor(MUTED).text(contactParts.join("   ·   "));

  // Summary
  heading(label("summary"));
  doc.font("Helvetica").fontSize(10).fillColor(TEXT).text(tr(profile.resumo_curto) || "", { align: "justify" });

  // Experience
  heading(label("experience"));
  const experiencias = profile.experiencias || [];
  experiencias.forEach((exp, i) => {
    entryHead(`${tr(exp.cargo)}  ·  ${exp.empresa}`, period(exp));
    doc.moveDown(0.2);
    for (const b of highlights(exp.descricao)) {
      doc.font("Helvetica").fontSize(9.5).fillColor(TEXT).text(`•  ${tr(b)}`);
      doc.moveDown(0.08);
    }
    if (exp.tecnologias?.length) {
      doc.moveDown(0.1);
      doc.font("Helvetica-Oblique").fontSize(8.5).fillColor(MUTED).text(exp.tecnologias.map(tr).join(" · "));
    }
    if (i < experiencias.length - 1) doc.moveDown(0.7);
  });

  // Education
  if (profile.formacao?.length) {
    heading(label("education"));
    profile.formacao.forEach((ed, i) => {
      entryHead(tr(ed.curso), period(ed));
      doc.font("Helvetica").fontSize(9.5).fillColor(MUTED)
        .text(`${ed.instituicao}${ed.local ? " · " + ed.local : ""}`);
      if (i < profile.formacao.length - 1) doc.moveDown(0.4);
    });
  }

  // Certifications
  if (profile.certificacoes?.length) {
    heading(label("certifications"));
    for (const c of profile.certificacoes) {
      doc.font("Helvetica").fontSize(9.5).fillColor(TEXT)
        .text(`•  ${c.nome}  —  ${c.instituicao}, ${isEn ? en(c.emissao) : c.emissao}`);
      doc.moveDown(0.1);
    }
  }

  // Skills
  heading(label("skills"));
  const skillEntries = Object.entries(profile.habilidades || {}).filter(([, v]) => v?.length);
  skillEntries.forEach(([key, items], i) => {
    const [pt, en_] = SKILL_LABELS[key] || [key, key];
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(TEXT).text(`${isEn ? en_ : pt}: `, { continued: true })
      .font("Helvetica").fillColor(MUTED).text(items.map(tr).join(", "));
    if (i < skillEntries.length - 1) doc.moveDown(0.25);
  });

  doc.end();
}

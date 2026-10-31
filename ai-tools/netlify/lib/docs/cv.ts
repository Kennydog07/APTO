/**
 * Tailored CV as an ATS-friendly, single-column document: standard headings, plain text,
 * no tables, columns, images or text boxes, so applicant tracking systems can read it.
 */
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { BorderStyle, Document, Packer, Paragraph, TextRun } from 'docx';
import { FlowWriter } from './pdf.ts';
import { ukDate, type Letter } from './letter.ts';
import type { CvOutput } from '../../../prompts/cv-tailor.ts';

type Cv = CvOutput['cv'];

/** Plain-text CV (shown on screen and used for copy/paste). */
export function cvToText(cv: Cv): string {
  const out: string[] = [cv.full_name];
  if (cv.contact_line) out.push(cv.contact_line);
  if (cv.headline) out.push(cv.headline);
  out.push('', 'PROFILE', cv.profile);
  if (cv.key_skills.length) out.push('', 'KEY SKILLS', cv.key_skills.join(' · '));
  if (cv.experience.length) {
    out.push('', 'EXPERIENCE');
    for (const e of cv.experience) {
      out.push(
        '',
        `${e.job_title} – ${e.employer}${e.location ? `, ${e.location}` : ''}${e.dates ? ` (${e.dates})` : ''}`,
      );
      for (const b of e.bullets) out.push(`• ${b}`);
    }
  }
  if (cv.education.length) {
    out.push('', 'EDUCATION');
    for (const e of cv.education) {
      out.push(
        `${e.qualification}${e.institution ? ` – ${e.institution}` : ''}${e.dates ? ` (${e.dates})` : ''}`,
      );
      if (e.details) out.push(e.details);
    }
  }
  for (const s of cv.extra_sections) {
    out.push('', s.heading.toUpperCase(), ...s.items.map((i) => `• ${i}`));
  }
  return out.join('\n');
}

export async function cvToPdf(cv: Cv): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${cv.full_name} – CV`);
  doc.setAuthor(cv.full_name);
  const fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  };
  const w = new FlowWriter(doc, fonts, { margin: 50, footer: '' });
  const heading = (t: string) => {
    w.space(10);
    w.text(t.toUpperCase(), { size: 11.5, bold: true, lineGap: 1.3 });
    w.space(2);
  };

  w.text(cv.full_name, { size: 20, bold: true, lineGap: 1.2 });
  if (cv.contact_line) w.text(cv.contact_line, { size: 10 });
  if (cv.headline) w.text(cv.headline, { size: 11, bold: true });
  heading('Profile');
  w.text(cv.profile, { size: 10.5 });
  if (cv.key_skills.length) {
    heading('Key skills');
    w.text(cv.key_skills.join(' · '), { size: 10.5 });
  }
  if (cv.experience.length) {
    heading('Experience');
    for (const e of cv.experience) {
      w.space(4);
      w.text(`${e.job_title} – ${e.employer}${e.location ? `, ${e.location}` : ''}`, {
        size: 10.5,
        bold: true,
      });
      if (e.dates) w.text(e.dates, { size: 10 });
      for (const b of e.bullets) w.text(`•  ${b}`, { size: 10.5 });
    }
  }
  if (cv.education.length) {
    heading('Education');
    for (const e of cv.education) {
      w.text(`${e.qualification}${e.institution ? ` – ${e.institution}` : ''}`, {
        size: 10.5,
        bold: true,
      });
      if (e.dates) w.text(e.dates, { size: 10 });
      if (e.details) w.text(e.details, { size: 10.5 });
    }
  }
  for (const s of cv.extra_sections) {
    heading(s.heading);
    for (const i of s.items) w.text(`•  ${i}`, { size: 10.5 });
  }
  return doc.save();
}

const FONT = 'Arial';
const run = (text: string, o: { size?: number; bold?: boolean } = {}) =>
  new TextRun({ text, font: FONT, size: (o.size ?? 10.5) * 2, bold: o.bold });
const p = (
  text: string,
  o: { size?: number; bold?: boolean; after?: number; bullet?: boolean } = {},
) =>
  new Paragraph({
    spacing: { after: o.after ?? 60 },
    ...(o.bullet ? { bullet: { level: 0 } } : {}),
    children: [run(text, o)],
  });
const h = (text: string) =>
  new Paragraph({
    spacing: { before: 200, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '999999', space: 2 } },
    children: [run(text.toUpperCase(), { size: 11.5, bold: true })],
  });

export async function cvToDocx(cv: Cv): Promise<Uint8Array> {
  const children: Paragraph[] = [p(cv.full_name, { size: 20, bold: true, after: 40 })];
  if (cv.contact_line) children.push(p(cv.contact_line, { size: 10 }));
  if (cv.headline) children.push(p(cv.headline, { size: 11, bold: true }));
  children.push(h('Profile'), p(cv.profile));
  if (cv.key_skills.length) children.push(h('Key skills'), p(cv.key_skills.join(' · ')));
  if (cv.experience.length) {
    children.push(h('Experience'));
    for (const e of cv.experience) {
      children.push(
        p(`${e.job_title} – ${e.employer}${e.location ? `, ${e.location}` : ''}`, {
          bold: true,
          after: 0,
        }),
      );
      if (e.dates) children.push(p(e.dates, { size: 10 }));
      for (const b of e.bullets) children.push(p(b, { bullet: true, after: 40 }));
    }
  }
  if (cv.education.length) {
    children.push(h('Education'));
    for (const e of cv.education) {
      children.push(
        p(`${e.qualification}${e.institution ? ` – ${e.institution}` : ''}`, {
          bold: true,
          after: 0,
        }),
      );
      if (e.dates) children.push(p(e.dates, { size: 10 }));
      if (e.details) children.push(p(e.details));
    }
  }
  for (const s of cv.extra_sections) {
    children.push(h(s.heading), ...s.items.map((i) => p(i, { bullet: true, after: 40 })));
  }
  const doc = new Document({
    title: `${cv.full_name} – CV`,
    creator: cv.full_name,
    sections: [{ children }],
  });
  return new Uint8Array(await Packer.toBuffer(doc));
}

/** Cover letter in the shared Letter format (rendered by letterToPdf/letterToDocx). */
export function buildCoverLetter(out: CvOutput, date = new Date()): Letter {
  const cl = out.cover_letter;
  const formal = /sir or madam/i.test(cl.salutation);
  return {
    senderLines: [
      out.cv.full_name,
      ...(out.cv.contact_line ? out.cv.contact_line.split(/\s*[·|•]\s*/).filter(Boolean) : []),
    ],
    dateLine: ukDate(date),
    recipientLines: ['Hiring Manager', ...(cl.company ? [cl.company] : [])],
    subjectLines: [`Application for ${cl.job_title}`],
    salutation: cl.salutation,
    paragraphs: cl.paragraphs,
    signOff: formal ? 'Yours faithfully,' : 'Yours sincerely,',
    signature: out.cv.full_name,
    footer: '',
  };
}

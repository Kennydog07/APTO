import { describe, expect, it } from 'vitest';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { Document, Packer, Paragraph } from 'docx';
import { cvTailorSchema, cvPreviewSchema } from '../shared/schemas/cv-tailor.ts';
import {
  assertNoFabrication,
  cvTailorPrompt,
  nameIsInSource,
  yearsNotInSource,
  type CvOutput,
} from '../prompts/cv-tailor.ts';
import { cvPreviewPrompt } from '../prompts/cv-preview.ts';
import { OutputParseError } from '../prompts/types.ts';
import { cvTailorGenerator } from '../netlify/lib/generators/cv-tailor.ts';
import { buildCoverLetter } from '../netlify/lib/docs/cv.ts';
import {
  cleanCvText,
  detectCvType,
  extractCvText,
  CvExtractError,
} from '../netlify/lib/cv-extract.ts';
import { downloadLabel } from '../netlify/lib/storage.ts';
import { TOOLS } from '../shared/tools.ts';

const CV = `Alex Example
alex@example.com · 07700 900123 · Exampletown
Office Manager, Acme Limited, Exampletown, 2019 – 2024
Managed a team of 5 administrators. Redesigned the filing process. Handled supplier orders.
Sales Assistant, Corner Shop & Co, 2016 – 2019
Served customers, handled cash and stock.
BA (Hons) History, University of Exampletown, 2013 – 2016
Skills: Excel, scheduling, customer service, basic bookkeeping, supplier management.`;

const ADVERT =
  'Office Manager wanted at Bright Futures Ltd. You will lead a small admin team, manage supplier relationships and keep basic books. Xero experience desirable.';

const inputs = cvTailorSchema.parse({ cvText: CV, advert: ADVERT, notes: 'emphasise leadership' });

const output: CvOutput = {
  cv: {
    full_name: 'Alex Example',
    contact_line: 'alex@example.com · 07700 900123 · Exampletown',
    headline: 'Office Manager',
    profile: 'Organised office manager with five years’ experience leading a small team.',
    key_skills: ['Team leadership', 'Supplier relationships', 'Basic bookkeeping'],
    experience: [
      {
        job_title: 'Office Manager',
        employer: 'Acme Ltd',
        location: 'Exampletown',
        dates: '2019 – 2024',
        bullets: ['Managed a team of 5 administrators'],
      },
      {
        job_title: 'Sales Assistant',
        employer: 'Corner Shop and Co',
        location: '',
        dates: '2016 – 2019',
        bullets: ['Served customers'],
      },
    ],
    education: [
      {
        qualification: 'BA (Hons) History',
        institution: 'University of Exampletown',
        dates: '2013 – 2016',
        details: '',
      },
    ],
    extra_sections: [],
  },
  cover_letter: {
    job_title: 'Office Manager',
    company: 'Bright Futures Ltd',
    salutation: 'Dear Hiring Manager,',
    paragraphs: [
      'I am applying for the Office Manager role.',
      'At Acme I led a team of five.',
      'I would welcome the chance to talk.',
    ],
  },
  changes_made: [
    'Rewrote the profile to lead with team leadership.',
    'Gap: Xero is not mentioned in your CV.',
  ],
};

describe('cv tailor config and schema', () => {
  it('£4.99 with a 5000 token cap; preview is a cheap 300-token call', () => {
    expect(TOOLS['cv-tailor'].pricePence).toBe(499);
    expect(cvTailorPrompt.max_tokens).toBe(5000);
    expect(cvPreviewPrompt.max_tokens).toBe(300);
    expect(cvPreviewPrompt.model).toBe('claude-haiku-5-5');
  });
  it('caps the advert at 6000 characters and needs real CV text', () => {
    expect(cvTailorSchema.safeParse({ cvText: CV, advert: 'x'.repeat(6001) }).success).toBe(false);
    expect(cvTailorSchema.safeParse({ cvText: 'too short', advert: ADVERT }).success).toBe(false);
    expect(
      cvTailorSchema.safeParse({ cvText: CV, advert: ADVERT, notes: 'x'.repeat(501) }).success,
    ).toBe(false);
    expect(cvPreviewSchema.safeParse({ cvText: CV, advert: ADVERT }).success).toBe(true);
  });
});

describe('cv prompts', () => {
  it('system prompt forbids invention and uses UK conventions', () => {
    const s = cvTailorPrompt.buildSystemPrompt();
    expect(s).toMatch(/NEVER invent or embellish experience, qualifications, employers/);
    expect(s).toMatch(/only REWORD, REORDER, CUT and EMPHASISE/);
    expect(s).toMatch(/Say "CV", never "résumé"/);
    expect(s).toMatch(/ATS-friendly/);
  });
  it('user prompt wraps CV, advert and notes as data', () => {
    const u = cvTailorPrompt.buildUserPrompt(inputs) as string;
    expect(u).toContain('<original_cv>');
    expect(u).toContain('Acme Limited');
    expect(u).toContain('<job_advert>');
    expect(u).toContain('emphasise leadership');
  });
  it('preview asks for exactly 3 bullets', () => {
    expect(cvPreviewPrompt.buildSystemPrompt()).toMatch(/exactly 3 short bullets/);
    expect(cvPreviewPrompt.parseOutput('{"fit":"good","bullets":["a","b","c"]}')).toEqual({
      fit: 'good',
      bullets: ['a', 'b', 'c'],
    });
    expect(() => cvPreviewPrompt.parseOutput('{"fit":"good","bullets":["a","b"]}')).toThrow(
      OutputParseError,
    );
  });
});

describe('anti-fabrication checks', () => {
  it('matches employer names despite Ltd/Limited and &/and differences', () => {
    expect(nameIsInSource('Acme Ltd', CV)).toBe(true);
    expect(nameIsInSource('Corner Shop and Co', CV)).toBe(true);
    expect(nameIsInSource('Google', CV)).toBe(false);
    expect(nameIsInSource('Acme Holdings', CV)).toBe(false);
  });
  it('finds years that are not in the original', () => {
    expect(yearsNotInSource('2019 – 2024', CV)).toEqual([]);
    expect(yearsNotInSource('2017 – 2024', CV)).toEqual(['2017']);
  });
  it('accepts an honest output', () => {
    expect(() => assertNoFabrication(output, CV)).not.toThrow();
    expect(cvTailorPrompt.parseOutput(JSON.stringify(output), inputs)).toMatchObject({
      changes_made: output.changes_made,
    });
  });
  it('rejects an invented employer, institution or date', () => {
    const bad = (patch: (o: CvOutput) => void) => {
      const o = structuredClone(output);
      patch(o);
      return () => cvTailorPrompt.parseOutput(JSON.stringify(o), inputs);
    };
    expect(bad((o) => (o.cv.experience[0]!.employer = 'Google'))).toThrow(
      /Employer not in original/,
    );
    expect(bad((o) => (o.cv.education[0]!.institution = 'University of Oxford'))).toThrow(
      /Institution not in original/,
    );
    expect(bad((o) => (o.cv.experience[1]!.dates = '2012 – 2019'))).toThrow(
      /Dates not in original/,
    );
  });
  it('rejects a cover letter that cannot fit on one page', () => {
    const o = structuredClone(output);
    o.cover_letter.paragraphs = [1, 2, 3, 4].map(() => 'word '.repeat(150).trim());
    expect(() => cvTailorPrompt.parseOutput(JSON.stringify(o), inputs)).toThrow(OutputParseError);
  });
});

describe('cv documents', () => {
  it('builds CV + cover letter as PDF and Word, with display text', async () => {
    const { files, display } = await cvTailorGenerator.build(inputs, output);
    expect(files.map((f) => f.filename)).toEqual([
      'tailored-cv.pdf',
      'tailored-cv.docx',
      'cover-letter.pdf',
      'cover-letter.docx',
    ]);
    for (const f of files) {
      if (f.filename.endsWith('.pdf'))
        expect((await PDFDocument.load(f.bytes)).getPageCount()).toBe(1);
      else expect(Buffer.from(f.bytes.slice(0, 2)).toString()).toBe('PK');
    }
    const d = display as { cvText: string; coverLetterText: string; changes: string[] };
    expect(d.cvText).toContain('EXPERIENCE');
    expect(d.cvText).toContain('Office Manager – Acme Ltd, Exampletown (2019 – 2024)');
    expect(d.coverLetterText).toContain('Dear Hiring Manager,');
    expect(d.coverLetterText).toContain('Yours sincerely,');
    expect(d.changes).toHaveLength(2);
  });
  it('uses "Yours faithfully" for Dear Sir or Madam', () => {
    const o = structuredClone(output);
    o.cover_letter.salutation = 'Dear Sir or Madam,';
    expect(buildCoverLetter(o).signOff).toBe('Yours faithfully,');
    expect(buildCoverLetter(o).senderLines).toEqual([
      'Alex Example',
      'alex@example.com',
      '07700 900123',
      'Exampletown',
    ]);
  });
  it('labels downloads from their file names', () => {
    expect(downloadLabel('cover-letter.docx')).toBe('Download cover letter (Word)');
    expect(downloadLabel('tailored-cv.pdf')).toBe('Download tailored cv (PDF)');
  });
});

describe('cv text extraction', () => {
  const lines = CV.replace(/[–·]/g, '-').split('\n');
  it('reads a text PDF', async () => {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const page = doc.addPage();
    lines.forEach((l, i) => page.drawText(l, { x: 40, y: 800 - i * 18, size: 10, font }));
    const { text, type } = await extractCvText(await doc.save());
    expect(type).toBe('pdf');
    expect(text).toContain('Office Manager, Acme Limited');
  });
  it('reads a DOCX', async () => {
    const d = new Document({ sections: [{ children: lines.map((t) => new Paragraph(t)) }] });
    const { text, type } = await extractCvText(new Uint8Array(await Packer.toBuffer(d)));
    expect(type).toBe('docx');
    expect(text).toContain('University of Exampletown');
  });
  it('rejects other files, files over 2MB, and near-empty (scanned) CVs', async () => {
    await expect(extractCvText(new TextEncoder().encode('just text'))).rejects.toBeInstanceOf(
      CvExtractError,
    );
    await expect(extractCvText(new Uint8Array(2 * 1024 * 1024 + 1))).rejects.toThrow(/2MB/);
    const doc = await PDFDocument.create();
    doc.addPage();
    await expect(extractCvText(await doc.save())).rejects.toThrow(/scanned/);
  });
  it('detects types by magic bytes and tidies whitespace', () => {
    expect(detectCvType(new TextEncoder().encode('%PDF-1.7'))).toBe('pdf');
    expect(detectCvType(new Uint8Array([0x50, 0x4b, 3, 4, 0]))).toBe('docx');
    expect(cleanCvText('a  b\r\n\r\n\r\n\r\nc  d')).toBe('a b\n\nc d');
  });
});

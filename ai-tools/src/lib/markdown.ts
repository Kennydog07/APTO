/**
 * Minimal, dependency-free Markdown -> HTML for blog posts. All text is HTML-escaped first.
 * Supports: # headings (1-4), paragraphs, - / * / 1. lists, > quotes, --- rules,
 * **bold**, *italic*, `code`, [links](url) and ![images](url).
 */
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function safeUrl(url: string): string {
  return /^(https?:\/\/|\/|#|mailto:)/i.test(url) ? url : '#';
}

function inline(s: string): string {
  return esc(s)
    .replace(
      /!\[([^\]]*)\]\(([^)\s]+)\)/g,
      (_m, alt, url) => `<img src="${safeUrl(url)}" alt="${alt}" loading="lazy">`,
    )
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text, url) => {
      const u = safeUrl(url);
      const ext = /^https?:\/\//.test(u) ? ' rel="noopener"' : '';
      return `<a href="${u}"${ext}>${text}</a>`;
    })
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
}

export function markdownToHtml(md: string): string {
  const out: string[] = [];
  const blocks = md.replace(/\r\n/g, '\n').split(/\n{2,}/);
  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;
    const lines = block.split('\n');
    const h = /^(#{1,4})\s+(.*)$/.exec(block);
    if (h && lines.length === 1) {
      // A post's own "#" becomes h2 because the page title is the h1.
      const level = Math.min(h[1]!.length + 1, 4);
      out.push(`<h${level}>${inline(h[2]!)}</h${level}>`);
    } else if (/^(-{3,}|\*{3,})$/.test(block)) {
      out.push('<hr>');
    } else if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
      out.push(
        `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*]\s+/, ''))}</li>`).join('')}</ul>`,
      );
    } else if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
      out.push(
        `<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`,
      );
    } else if (lines.every((l) => l.startsWith('>'))) {
      out.push(
        `<blockquote><p>${inline(lines.map((l) => l.replace(/^>\s?/, '')).join(' '))}</p></blockquote>`,
      );
    } else {
      out.push(`<p>${lines.map(inline).join('<br>')}</p>`);
    }
  }
  return out.join('\n');
}

/** Split "---\nkey: value\n---\nbody" front matter. Values may be quoted. */
export function parseFrontMatter(src: string): { data: Record<string, string>; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(src);
  if (!m) return { data: {}, body: src };
  const data: Record<string, string> = {};
  for (const line of m[1]!.split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (kv) data[kv[1]!] = kv[2]!.trim().replace(/^["'](.*)["']$/, '$1');
  }
  return { data, body: m[2]! };
}

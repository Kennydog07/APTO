import { describe, expect, it } from 'vitest';
import { markdownToHtml, parseFrontMatter } from '../src/lib/markdown.ts';

describe('blog markdown', () => {
  it('parses front matter', () => {
    const { data, body } = parseFrontMatter('---\ntitle: "Hello"\ndate: 2026-01-01\n---\n# Hi');
    expect(data).toEqual({ title: 'Hello', date: '2026-01-01' });
    expect(body).toBe('# Hi');
  });
  it('renders common markdown', () => {
    const html = markdownToHtml(
      '# Title\n\nSome **bold** and *it* with [a link](/x).\n\n- one\n- two\n\n1. a\n2. b',
    );
    expect(html).toContain('<h2>Title</h2>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>it</em>');
    expect(html).toContain('<a href="/ai/x">a link</a>'); // internal links get the base path
    expect(html).toContain('<ul><li>one</li><li>two</li></ul>');
    expect(html).toContain('<ol><li>a</li><li>b</li></ol>');
  });
  it('escapes HTML and blocks javascript: links', () => {
    const html = markdownToHtml('<script>alert(1)</script> [x](javascript:alert(1))');
    expect(html).not.toContain('<script>');
    expect(html).toContain('href="#"');
  });
});

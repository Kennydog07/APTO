/**
 * Blog posts are Markdown files in /content/blog/<slug>.md, bundled at build time.
 * The marketing bot adds a post by committing a new .md file (see MARKETING_BOT.md).
 */
import { markdownToHtml, parseFrontMatter } from './markdown';

export interface Post {
  slug: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  html: string;
}

const files = import.meta.glob('/content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const POSTS: Post[] = Object.entries(files)
  .map(([path, src]) => {
    const slug = path.split('/').pop()!.replace(/\.md$/, '');
    const { data, body } = parseFrontMatter(src);
    return {
      slug,
      title: data.title || slug,
      description: data.description || '',
      date: data.date || '1970-01-01',
      html: markdownToHtml(body),
      draft: data.draft === 'true',
    };
  })
  .filter((p) => /^[a-z0-9-]+$/.test(p.slug) && !p.draft)
  .sort((a, b) => b.date.localeCompare(a.date));

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);

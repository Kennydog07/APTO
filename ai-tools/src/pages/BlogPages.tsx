import { BRAND } from '../config/brand';
import { POSTS, getPost } from '../lib/blog';
import { Link } from '../lib/router';
import { Seo } from '../lib/seo';
import { NotFoundPage } from './NotFoundPage';

const fmt = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export function BlogIndexPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <Seo
        title={`Blog – ${BRAND.name}`}
        description="Guides and tips for everyday admin: parking appeals, speeches, CVs and more."
        path="/blog"
      />
      <h1 className="text-3xl font-bold">Blog</h1>
      {POSTS.length === 0 && <p className="mt-4">No posts yet.</p>}
      <ul className="mt-6 space-y-6">
        {POSTS.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/blog/${p.slug}`}
              className="text-xl font-semibold text-blue-800 hover:underline"
            >
              {p.title}
            </Link>
            <p className="text-sm text-stone-600">
              <time dateTime={p.date}>{fmt(p.date)}</time>
            </p>
            <p className="mt-1 text-stone-700">{p.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function BlogPostPage({ slug }: { slug: string }) {
  const post = getPost(slug);
  if (!post) return <NotFoundPage />;
  return (
    <article className="prose-simple mx-auto max-w-3xl px-4 py-10">
      <Seo
        title={`${post.title} – ${BRAND.name}`}
        description={post.description}
        path={`/blog/${post.slug}`}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            publisher: { '@type': 'Organization', name: BRAND.name },
          },
        ]}
      />
      <p className="text-sm">
        <Link href="/blog">← All posts</Link>
      </p>
      <h1>{post.title}</h1>
      <p className="text-sm text-stone-600">
        <time dateTime={post.date}>{fmt(post.date)}</time>
      </p>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  );
}

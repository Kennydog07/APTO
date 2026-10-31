import { Link } from '../lib/router';
import { Seo } from '../lib/seo';

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <Seo title="Page not found" description="This page does not exist." path="/404" noindex />
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2">
        <Link href="/" className="text-blue-800 underline">
          Go to the home page
        </Link>
      </p>
    </section>
  );
}

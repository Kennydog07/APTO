import { Layout } from './components/Layout';
import { useLocation } from './lib/router';
import { HomePage } from './pages/HomePage';
import { DonePage } from './pages/DonePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ContactPage, PrivacyPage, RefundsPage, TermsPage } from './pages/LegalPages';
import { BlogIndexPage, BlogPostPage } from './pages/BlogPages';
import { ParkingAppealPage } from './tools/parking-appeal/Page';

/** Static routes. Each one is pre-rendered to HTML at build time. */
export const STATIC_ROUTES: Record<string, () => React.ReactElement> = {
  '/': () => <HomePage />,
  '/parking-appeal': () => <ParkingAppealPage />,
  '/terms': () => <TermsPage />,
  '/privacy': () => <PrivacyPage />,
  '/refunds': () => <RefundsPage />,
  '/contact': () => <ContactPage />,
  '/blog': () => <BlogIndexPage />,
};

function Route() {
  const { pathname } = useLocation();
  const page = STATIC_ROUTES[pathname];
  if (page) return page();

  const done = /^\/t\/([a-z-]+)\/done$/.exec(pathname);
  if (done) return <DonePage toolId={done[1]!} />;

  const post = /^\/blog\/([a-z0-9-]+)$/.exec(pathname);
  if (post) return <BlogPostPage slug={post[1]!} />;

  return <NotFoundPage />;
}

export function App() {
  return (
    <Layout>
      <Route />
    </Layout>
  );
}

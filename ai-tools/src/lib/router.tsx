/**
 * A tiny client router (history API) so we don't need an extra dependency.
 * During pre-rendering the URL comes from <RouterProvider url=...>.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react';
import { stripBase, withBase } from '../../shared/paths';

interface Loc {
  pathname: string;
  search: string;
}
const RouterCtx = createContext<{ loc: Loc; navigate: (to: string) => void }>({
  loc: { pathname: '/', search: '' },
  navigate: () => {},
});

function parse(url: string): Loc {
  const u = new URL(url, 'http://x');
  // App-relative path without trailing slash: "/ai/terms/" -> "/terms". The base path is
  // added back by navigate() and <Link>.
  const rel = stripBase(u.pathname);
  const pathname = rel.length > 1 ? rel.replace(/\/+$/, '') : rel;
  return { pathname, search: u.search };
}

export function RouterProvider({ url, children }: { url?: string; children: ReactNode }) {
  const [loc, setLoc] = useState<Loc>(() =>
    parse(
      url ??
        (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/'),
    ),
  );

  useEffect(() => {
    const onPop = () => setLoc(parse(window.location.pathname + window.location.search));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', withBase(to));
    setLoc(parse(to));
    window.scrollTo(0, 0);
  };

  return <RouterCtx.Provider value={{ loc, navigate }}>{children}</RouterCtx.Provider>;
}

export const useLocation = () => useContext(RouterCtx).loc;
export const useNavigate = () => useContext(RouterCtx).navigate;

/**
 * Internal link: client-side navigation, but a normal <a href> for crawlers and new tabs.
 * `href` is app-relative ("/terms"); the base path ("/ai") is added automatically.
 */
export function Link({
  href,
  onClick,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const navigate = useNavigate();
  return (
    <a
      href={withBase(href)}
      onClick={(e) => {
        onClick?.(e);
        if (
          e.defaultPrevented ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey
        )
          return;
        if (!href.startsWith('/') || href.startsWith('//')) return;
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    />
  );
}

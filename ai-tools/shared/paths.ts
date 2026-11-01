/**
 * Every page, asset and API route of the tools lives under this path, so the tools can be
 * merged into the main apto-pro.com site without clashing with it (apto-pro.com/ai/...).
 *
 * To change it you must ALSO update: vite.config.ts (base), the literal `path:` values in
 * netlify/functions/*.ts, netlify.toml, and then regenerate the merge kit
 * (`npm run merge-kit`). A unit test checks they all agree.
 */
export const BASE_PATH = '/ai';

/** "/parking-appeal" -> "/ai/parking-appeal"; "/" -> "/ai/". Leaves full URLs alone. */
export function withBase(path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) return path;
  return path === '/' ? `${BASE_PATH}/` : `${BASE_PATH}${path}`;
}

/** "/ai/parking-appeal" -> "/parking-appeal"; "/ai" or "/ai/" -> "/". */
export function stripBase(pathname: string): string {
  if (pathname === BASE_PATH || pathname === `${BASE_PATH}/`) return '/';
  return pathname.startsWith(`${BASE_PATH}/`) ? pathname.slice(BASE_PATH.length) : pathname;
}

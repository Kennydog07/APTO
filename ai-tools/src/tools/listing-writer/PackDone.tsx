import { TOOLS } from '../../../shared/tools';

/** Done page after buying a pack: link to the writer with the token. */
export function PackDone({
  r,
}: {
  r: { token: string; added: number; remaining: number; topUp: boolean };
}) {
  const href = `${TOOLS['listing-writer'].route}?token=${r.token}`;
  return (
    <div className="space-y-4 rounded-lg bg-white p-5 ring-1 ring-stone-200">
      <p className="text-lg">
        {r.topUp ? `${r.added} listings added.` : `Your ${r.added} listings are ready.`} You have{' '}
        <strong>{r.remaining}</strong> to use.
      </p>
      <a
        href={href}
        className="inline-block rounded-md bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-700/30"
      >
        Start writing listings
      </a>
      <p className="text-sm text-stone-600">
        We’ve emailed you this private link too. Bookmark it: it’s the only key to your credits, so
        don’t share it.
      </p>
    </div>
  );
}

import { CopyButton } from '../../components/ui';
import type { MealDisplay } from '../../../shared/meal-display';

export type { MealDisplay };

const PASTEL = [
  'bg-rose-50',
  'bg-orange-50',
  'bg-yellow-50',
  'bg-green-50',
  'bg-sky-50',
  'bg-violet-50',
  'bg-pink-50',
];
const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);
const gbp = (n: number) => `£${n.toFixed(2)}`;

export function MealPlanResult({ r }: { r: MealDisplay }) {
  return (
    <div className="space-y-5">
      <p className="rounded-lg bg-amber-50 p-3 text-sm font-semibold ring-1 ring-amber-200">
        {r.notice}
      </p>
      <p className="text-sm text-stone-700">{r.subtitle}</p>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-1 text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Day</th>
              {r.columns.map((c) => (
                <th key={c} className="p-2">
                  {cap(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {r.days.map((d, i) => (
              <tr key={d.day} className={PASTEL[i % 7]}>
                <th scope="row" className="rounded-l-lg p-2 text-left">
                  {d.day}
                </th>
                {r.columns.map((c, j) => (
                  <td key={c} className={`p-2 ${j === r.columns.length - 1 ? 'rounded-r-lg' : ''}`}>
                    {d[c]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="font-semibold">
        Estimated shop: {gbp(r.total)} (budget {gbp(r.budget)}){' '}
        <span className="font-normal text-stone-600">– estimate, prices vary</span>
      </p>

      <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-semibold">Shopping list</h3>
          <CopyButton text={r.shoppingText} label="Copy shopping list" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {r.shopping.map((g) => (
            <div key={g.aisle}>
              <h4 className="font-semibold text-indigo-900">{g.aisle}</h4>
              <ul className="mt-1 space-y-0.5 text-sm">
                {g.items.map((i) => (
                  <li key={i.item} className="flex justify-between gap-2">
                    <span>
                      ☐ {i.item} – {i.quantity}
                    </span>
                    <span className="text-stone-500">{gbp(i.cost)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {r.tips.length > 0 && (
        <section className="rounded-lg bg-emerald-50 p-4 ring-1 ring-emerald-200">
          <h3 className="font-semibold">Tips for the week</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {r.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      <h3 className="text-lg font-bold">Recipes</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {r.recipes.map((rc, i) => (
          <article
            key={rc.name}
            className={`rounded-lg p-4 ring-1 ring-stone-200 ${PASTEL[i % 7]}`}
          >
            <h4 className="font-semibold">{rc.name}</h4>
            <p className="text-xs text-stone-600">
              Serves {rc.serves} · about {rc.minutes} minutes
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {rc.ingredients.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
              {rc.steps.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
          </article>
        ))}
      </div>
      <p className="text-xs text-stone-600">{r.notice}</p>
    </div>
  );
}

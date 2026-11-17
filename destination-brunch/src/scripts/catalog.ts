// Search, filter and sort for /destinations and /guides.
// Reads and writes the URL (?q=&region=&cat=&sort=) so filtered views can be shared and the
// homepage search can link straight to results.
const root = document.querySelector<HTMLElement>('[data-catalog]');
const list = document.querySelector<HTMLElement>('[data-list]');

if (root && list) {
  const q = root.querySelector<HTMLInputElement>('#f-q')!;
  const region = root.querySelector<HTMLSelectElement>('#f-region')!;
  const sort = root.querySelector<HTMLSelectElement>('#f-sort')!;
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-cat]')];
  const count = document.querySelector<HTMLElement>('[data-count]')!;
  const reset = document.querySelector<HTMLButtonElement>('[data-reset]')!;
  const empty = document.querySelector<HTMLElement>('[data-empty]')!;
  const items = [...list.querySelectorAll<HTMLElement>('[data-item]')];
  const noun = root.dataset.noun || 'item';
  const nounPlural = root.dataset.nounPlural || 'items';
  let cat = '';

  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

  const setCat = (c: string) => {
    cat = chips.some((b) => b.dataset.cat === c) ? c : '';
    chips.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === cat)));
  };

  // Restore state from the URL
  const params = new URLSearchParams(location.search);
  q.value = params.get('q') || '';
  if (params.get('region') && [...region.options].some((o) => o.value === params.get('region'))) region.value = params.get('region')!;
  if (params.get('sort') && [...sort.options].some((o) => o.value === params.get('sort'))) sort.value = params.get('sort')!;
  setCat(params.get('cat') || '');

  const apply = (updateUrl = true) => {
    const words = norm(q.value).split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const el of items) {
      const hay = norm(el.dataset.search || '');
      const ok =
        words.every((w) => hay.includes(w)) &&
        (!region.value || el.dataset.region === region.value) &&
        (!cat || (el.dataset.cats || '').split(' ').includes(cat));
      el.hidden = !ok;
      if (ok) shown++;
    }
    const s = sort.value;
    const sorted = [...items].sort((a, b) => {
      const an = a.dataset.name || '', bn = b.dataset.name || '';
      const ap = Number(a.dataset.price), bp = Number(b.dataset.price);
      if (s === 'za') return bn.localeCompare(an);
      if (s === 'price-asc') return ap - bp || an.localeCompare(bn);
      if (s === 'price-desc') return bp - ap || an.localeCompare(bn);
      return an.localeCompare(bn);
    });
    sorted.forEach((el) => list.appendChild(el));

    count.textContent = `Showing ${shown} ${shown === 1 ? noun : nounPlural}`;
    empty.hidden = shown > 0;
    const active = !!(q.value.trim() || region.value || cat || sort.value !== 'az');
    reset.hidden = !active;

    if (updateUrl) {
      const p = new URLSearchParams(location.search);
      const setP = (k: string, v: string) => (v ? p.set(k, v) : p.delete(k));
      setP('q', q.value.trim());
      setP('region', region.value);
      setP('cat', cat);
      setP('sort', sort.value === 'az' ? '' : sort.value);
      const qs = p.toString();
      history.replaceState(null, '', location.pathname + (qs ? `?${qs}` : '') + location.hash);
    }
  };

  let t: number | undefined;
  q.addEventListener('input', () => {
    clearTimeout(t);
    t = window.setTimeout(apply, 120);
  });
  region.addEventListener('change', () => apply());
  sort.addEventListener('change', () => apply());
  chips.forEach((b) => b.addEventListener('click', () => { setCat(b.dataset.cat || ''); apply(); }));
  const clearAll = () => {
    q.value = '';
    region.value = '';
    sort.value = 'az';
    setCat('');
    apply();
    q.focus();
  };
  reset.addEventListener('click', clearAll);
  document.querySelectorAll('[data-reset-empty]').forEach((b) => b.addEventListener('click', clearAll));

  apply(false);
}

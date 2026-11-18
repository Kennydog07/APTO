"""Add the "Best pubs, bars & restaurants" section to a city brunch app.

Usage:  python3 city-app-picks/build.py <source-app-folder> <output-folder> <site-name>
  e.g.  python3 city-app-picks/build.py backup/brunch-barcelona out/brunch-barcelona brunch-barcelona

The source folder must be an unmodified copy of the app. The output folder is a full
copy of the app with the section added, ready to deploy. Running it again on the
original copy simply rebuilds the section from picks.json.
"""
import html, json, os, re, shutil, sys
from urllib.parse import quote_plus

here = os.path.dirname(os.path.abspath(__file__))
src, out, site = sys.argv[1], sys.argv[2], sys.argv[3]
data = json.load(open(os.path.join(here, "picks.json"), encoding="utf-8"))
city = data["cities"][site]
CUR = {"brunch-barcelona": "€", "brunch-manchester": "£", "brunch-brighton": "£", "brunch-bangkok": "฿"}.get(site, "$")
LABEL = {"bar": ("🍸", "Bars", "Bar"), "pub": ("🍺", "Pubs", "Pub"), "restaurant": ("🍽️", "Restaurants", "Restaurant")}
e = lambda s: html.escape(s, quote=True)

index = open(os.path.join(src, "index.html"), encoding="utf-8").read()
if 'id="picks"' in index:
    sys.exit("Source already has the picks section: use an unmodified copy of the app.")

if os.path.exists(out):
    shutil.rmtree(out)
shutil.copytree(src, out, ignore=shutil.ignore_patterns(".mirror-manifest.json"))
for f in ("picks.js", "picks.css"):
    shutil.copy(os.path.join(here, f), os.path.join(out, f))

# ---- section HTML -----------------------------------------------------------
types = []
for it in city["items"]:
    if it["type"] not in types:
        types.append(it["type"])
counts = {t: sum(1 for it in city["items"] if it["type"] == t) for t in types}
chips = ['<button type="button" class="chip" data-type="" aria-pressed="true">All <b>%d</b></button>' % len(city["items"])]
chips += ['<button type="button" class="chip" data-type="%s" aria-pressed="false"><span>%s</span> %s <b>%d</b></button>' % (t, LABEL[t][0], LABEL[t][1], counts[t]) for t in types]

cards = []
for it in city["items"]:
    q = quote_plus(f'{it["name"]}, {city["city"]}')
    level = int(it["price"])
    cards.append(
        f'<article class="pk-card" data-type="{it["type"]}">'
        f'<div class="pk-top"><span class="pk-type">{LABEL[it["type"]][0]} {LABEL[it["type"]][2]}</span>'
        f'<span class="pk-price" title="Price level {level} of 4"><span class="sr-only">Price level {level} of 4: </span>{CUR * level}<i aria-hidden="true">{CUR * (4 - level)}</i></span></div>'
        f'<h3>{e(it["name"])}</h3>'
        f'<p class="pk-area">📍 {e(it["area"])}</p>'
        f'<p class="pk-what">{e(it["what"])}</p>'
        f'<a class="pk-map" href="https://www.google.com/maps/search/?api=1&amp;query={q}" target="_blank" rel="noopener">Open in Maps <span aria-hidden="true">↗</span><span class="sr-only"> for {e(it["name"])} (opens Google Maps)</span></a>'
        f'</article>'
    )
sources = ", ".join(f'<a href="{e(s["url"])}" target="_blank" rel="noopener">{e(s["label"])}</a>' for s in city["sources"])
names = " &amp; ".join([", ".join(LABEL[t][1].lower() for t in types[:-1]), LABEL[types[-1]][1].lower()]) if len(types) > 1 else LABEL[types[0]][1].lower()
section = f'''
  <section class="picks" id="picks" aria-labelledby="pkTitle">
    <div class="section-head">
      <div>
        <p class="kicker">Beyond brunch</p>
        <h2 id="pkTitle" tabindex="-1">Best {names} in <em>{e(city["city"])}</em></h2>
      </div>
      <p class="section-note">Our picks for the rest of your trip.</p>
    </div>
    <div class="chips pk-chips" role="group" aria-label="Show">{"".join(chips)}</div>
    <div class="pk-grid">{"".join(cards)}</div>
    <p class="pk-note">Editor's picks based on respected local and international guides, checked {e(data["checked"])}. Not paid placements, and not affiliated with the venues. Opening hours, prices and bookings change, so please check with the venue before you go. Sources include {sources}.</p>
  </section>
'''

# ---- patch index.html ---------------------------------------------------------
def sub_once(pattern, repl, s):
    new, n = re.subn(pattern, repl, s, count=1)
    if n != 1:
        sys.exit(f"Could not find {pattern!r} in index.html")
    return new

index = sub_once(r'(<link rel="stylesheet" href="maps\.css">)', r'\1\n<link rel="stylesheet" href="picks.css">', index)
index = sub_once(r'(\n\s*<section class="log" id="log")', section.rstrip() + r'\n\1', index)
index = sub_once(r'(<a class="nav-log" id="navLog")', '<a class="nav-log nav-picks" href="#picks"><span aria-hidden="true">🍸</span><span class="nav-picks-label"> Eat &amp; drink</span><span class="sr-only">Best pubs, bars and restaurants</span></a>' + r'\1', index)
index = sub_once(r'(<script src="maps\.js"></script>)', r'\1\n<script src="picks.js"></script>', index)
open(os.path.join(out, "index.html"), "w", encoding="utf-8").write(index)

# ---- service worker: cache the new files and pick up updates -----------------
sw_path = os.path.join(out, "sw.js")
sw = open(sw_path, encoding="utf-8").read()
m = re.search(r"var CACHE='([a-z0-9-]+)-v(\d+)';", sw)
sw = sw.replace(m.group(0), f"var CACHE='{m.group(1)}-v{int(m.group(2)) + 1}';")
sw = sw.replace('"maps.js", "maps.css",', '"maps.js", "maps.css", "picks.js", "picks.css",', 1)
sw = sw.replace(r"styles\.css|manifest", r"styles\.css|picks\.js|picks\.css|manifest", 1)
assert '"picks.js"' in sw and r"picks\.js" in sw, "service worker patch failed"
open(sw_path, "w", encoding="utf-8").write(sw)
print(f"{site}: added {len(city['items'])} picks ({', '.join(f'{counts[t]} {t}' for t in types)}); cache {m.group(1)}-v{int(m.group(2)) + 1}")

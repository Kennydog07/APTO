"""Add an Arabic version (ar/) and the map to the Brunch Doha app (Nov 2026).

Usage: python3 build-doha-brunch-ar.py <unmodified-brunch-doha> <brunch-abu-dhabi-reference> <geo-json> <output>
The Arabic page and code come from the Abu Dhabi app (same template) with every Abu Dhabi detail swapped
for Doha's; the data is Brunch Doha's own, translated with doha-brunch-ar.py. Stops if any expected text is missing.
"""
import copy, importlib.util, json, os, re, shutil, sys

src, ref, geo_path, out = sys.argv[1:5]
here = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("tr", os.path.join(here, "doha-brunch-ar.py"))
tr = importlib.util.module_from_spec(spec); spec.loader.exec_module(tr)

def R(p): return open(p, encoding="utf-8").read()
def W(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True); open(p, "w", encoding="utf-8").write(s)
def rep(s, old, new, label=None, regex=False):
    n = len(re.findall(old, s, flags=re.S)) if regex else s.count(old)
    if n == 0:
        sys.exit(f"Not found ({label or old[:60]!r}) - stopping so nothing is half-converted.")
    return re.sub(old, new, s, flags=re.S) if regex else s.replace(old, new)

if os.path.exists(out):
    shutil.rmtree(out)
shutil.copytree(src, out, ignore=shutil.ignore_patterns(".mirror-manifest.json"))
if os.path.exists(os.path.join(src, "ar")):
    sys.exit("Source already has ar/ - use an unmodified copy.")

# ---- shared files from the Abu Dhabi template (map + Arabic assets)
for f in ["maps.js", "maps.css", "lib/leaflet/leaflet.js", "lib/leaflet/leaflet.css", "ar/rtl.css"] + \
         [f"ar/fonts/{x}" for x in os.listdir(os.path.join(ref, "ar/fonts"))]:
    os.makedirs(os.path.dirname(os.path.join(out, f)), exist_ok=True)
    shutil.copy(os.path.join(ref, f), os.path.join(out, f))

# ---- geo.js
GEO = json.load(open(geo_path))
W(os.path.join(out, "geo.js"),
  "/* Venue coordinates from OpenStreetMap Nominatim (19 Nov 2026). 'venue' = matched to the venue, 'area'/'city' = approximate. */\n"
  'window.MAP_CITY={"q": "Doha, Qatar", "c": [25.32, 51.52]};\n'
  "window.GEO=" + json.dumps(GEO) + ";\n")

# ---- English page: language switch + map
p = os.path.join(out, "index.html"); h = R(p)
h = rep(h, '<meta name="theme-color" content="#5c0f22">', '<meta name="theme-color" content="#5c0f22">\n<link rel="alternate" hreflang="ar" href="ar/index.html">')
h = rep(h, '<link rel="stylesheet" href="styles.css">', '<link rel="stylesheet" href="styles.css">\n<link rel="stylesheet" href="maps.css">')
h = rep(h, '<span class="nav-meta">Weekend brunch guide · Qatar</span>',
        "<span class=\"nav-meta\">Weekend brunch guide · Qatar</span><a class='lang-switch' href='/ar/' hreflang='ar' lang='ar'>العربية</a>")
h = rep(h, '<script src="app.js"></script>', '<script src="app.js"></script>\n<script src="geo.js"></script>\n<script src="maps.js"></script>')
W(p, h)

# ---- Arabic data
s = R(os.path.join(src, "data.js")); head, data = s[:s.index("{")], json.loads(s[s.index("{"):s.rindex("}") + 1])
ar = copy.deepcopy(data)
missing = []
def T(table, v, field):
    if not v: return v
    if v in table: return table[v]
    missing.append((field, v)); return v
def M(v):
    try: return tr.meta(v)
    except KeyError: missing.append(("meta", v)); return v
def tr_entry(e):
    e["name"] = T(tr.NAME, e.get("name"), "name")
    e["cuisine"] = T(tr.CUISINE, e.get("cuisine"), "cuisine")
    e["highlights"] = T(tr.HIGHLIGHTS, e.get("highlights"), "highlights")
    e["notice"] = T(tr.NOTICE, e.get("notice"), "notice")
    e["linkLabel"] = T(tr.LINK, e.get("linkLabel"), "linkLabel")
    e["upgrade"] = tr.UPGRADE.get(e.get("upgrade"), tr.phrase(e.get("upgrade")))
    e["hours"] = tr.hours(e.get("hours"))
    e["alc"] = tr.phrase(e.get("alc"))
    e["priceText"] = tr.phrase(e.get("priceText"))
    d = e.get("drinks")
    if d:
        if d.get("label"): d["label"] = T(tr.DRINKS_LABEL, d["label"], "drinks.label")
        for pk in d.get("packages", []):
            pk["name"] = tr.phrase(pk.get("name")); pk["sourceDate"] = M(pk.get("sourceDate"))
    dl = e.get("deal")
    if dl:
        dl["note"] = M(dl.get("note")); dl["sourceDate"] = M(dl.get("sourceDate"))
for b in ar["brunches"]:
    tr_entry(b)
    b["area"] = T(tr.AREA, b["area"], "area"); b["areaGroup"] = T(tr.GROUP, b["areaGroup"], "areaGroup")
    for dk in b["byDay"]:
        tr_entry(b["byDay"][dk])
if missing:
    sys.exit("Untranslated: " + repr(missing[:10]))
W(os.path.join(out, "ar/data.js"), head.replace("Brunch Doha data", "Brunch Doha data (Arabic)") +
  json.dumps(ar, ensure_ascii=False, indent=0) + ";\n")

# ---- Arabic app code: Abu Dhabi's Arabic template with Doha's settings
a = R(os.path.join(ref, "ar/app.js"))
a = rep(a, "BMIN=150,BMAX=600,BSTEP=25,CHEAP=300", "BMIN=150,BMAX=400,BSTEP=10,CHEAP=300")
a = rep(a, "+4*3600000", "+3*3600000", "time zone")
a = rep(a, '  return "sat";\n}\nfunction nextDate', '  return "fri";\n}\nfunction nextDate', "default day")
a = rep(a, '"uae","abu","dhabi"', '"qatar","doha","الدوحة","قطر"')
a = rep(a, '"aed","dhs","dh","dirham"', '"qar","qr","riyal","ريال"')
a = rep(a, "(?:aed|dhs|dh|dirhams?)", "(?:qar|qr|riyals?|ريال|ر\\.ق)")
a = rep(a, "bdad_", "bd_")  # share the brunch log and saved list with the English Doha app
a = rep(a, "درهم", "ر.ق")
a = rep(a, '["لاتيني أقل من 350","latin under 350"]', '["هندي أقل من 250","indian under 250"]')
a = rep(a, "برانش في أبوظبي", "برانش في قطر")
a = rep(a, "أبوظبي", "الدوحة")
a = rep(a, '"Brunch Abu Dhabi"', '"Brunch Doha"')
a = rep(a, "brunch-abu-dhabi-log-", "brunch-doha-log-")
a = rep(a, r'var order=\[[^\]]*\];', 'var order=["الخليج الغربي","لوسيل","اللؤلؤة وكتارا","مشيرب والدوحة القديمة","منتجعات الشاطئ والصحراء","الدوحة"];', "area order", regex=True)
left = re.findall(r"أبوظبي|أبو ظبي|الإمارات|درهم|\buae\b|\babu\b|dhabi|\baed\b|bdad|Abu Dhabi|abu-dhabi", a)
if left: sys.exit("Abu Dhabi text left in ar/app.js: " + repr(set(left)))
W(os.path.join(out, "ar/app.js"), a)

# ---- Arabic page
h = R(os.path.join(ref, "ar/index.html"))
h = rep(h, "برانش أبوظبي · اعثر على برانش الجمعة أو السبت في أبوظبي", "برانش الدوحة · اعثر على برانش الجمعة أو السبت في قطر")
h = rep(h, "في السعديات وجزيرة ياس وجزيرة الماريه والكورنيش،", "في الدوحة ولوسيل واللؤلؤة،")
h = rep(h, "#0b4f34", "#5c0f22")
h = rep(h, "كل برانشات عطلة نهاية الأسبوع في أبوظبي،", "كل برانشات عطلة نهاية الأسبوع في قطر،")
h = rep(h, "brunch-abu-dhabi.netlify.app", "brunch-doha.netlify.app")
h = rep(h, "السعديات · ياس · الماريه", "الدوحة · لوسيل · اللؤلؤة")
h = rep(h, "أفضل برانشات أبوظبي،", "أفضل برانشات قطر،")
h = rep(h, "«لاتيني أقل من 350»", "«هندي أقل من 250»")
h = rep(h, "دليل برانش عطلة نهاية الأسبوع · الإمارات", "دليل برانش عطلة نهاية الأسبوع · قطر")
h = rep(h, 'min="150" max="600" step="25" value="600" aria-label="الحد الأقصى للميزانية بـدرهم"',
        'min="150" max="400" step="10" value="400" aria-label="الحد الأقصى للميزانية بالريال القطري"')
h = rep(h, r'(<b>🏷️[^<]*</b>).*?(\(آخر تحقق <span id="dealDate">)', r'\1 تُظهر شارات العروض البرانشات التي تدرجها الأدلة المحلية أو التطبيقات نفسها بعرض 2 مقابل 1 أو خصم على تطبيقات مثل إنترتينر وأوربان بوينت وماي بوك ومور كريفينغز وسابر كلوب \2', "deal note", regex=True)
h = rep(h, "آخر تحقق من الأسعار نوفمبر 2026", "آخر تحقق من الأسعار أكتوبر–نوفمبر 2026")
h = rep(h, "درهم", "ر.ق")
h = rep(h, "أبوظبي", "الدوحة")
left = re.findall(r"أبوظبي|أبو ظبي|الإمارات|درهم|abu-dhabi|Abu Dhabi|AED|السعديات|ياس|الماريه", h)
if left: sys.exit("Abu Dhabi text left in ar/index.html: " + repr(set(left)))
W(os.path.join(out, "ar/index.html"), h)

m = json.loads(R(os.path.join(ref, "ar/manifest.webmanifest")))
en_m = json.loads(R(os.path.join(src, "manifest.webmanifest")))
m.update({"name": "برانش الدوحة", "short_name": "برانش الدوحة", "description": "اعثر على برانشات الجمعة والسبت في قطر حسب ما تشتهيه.",
          "background_color": en_m.get("background_color", m.get("background_color")), "theme_color": en_m.get("theme_color", m.get("theme_color"))})
W(os.path.join(out, "ar/manifest.webmanifest"), json.dumps(m, ensure_ascii=False, indent=2))

# ---- offline cache: add new files, refresh rules, bump version
p = os.path.join(out, "sw.js"); sw = R(p)
assets = json.loads(re.search(r"var ASSETS=(\[.*?\]);", sw, re.S).group(1))
add = ["ar/", "ar/index.html", "ar/rtl.css", "ar/manifest.webmanifest", "ar/app.js", "ar/data.js"] + \
      [f"ar/fonts/{x}" for x in sorted(os.listdir(os.path.join(ref, "ar/fonts")))] + \
      ["maps.js", "maps.css", "geo.js", "lib/leaflet/leaflet.js", "lib/leaflet/leaflet.css"]
assets += [x for x in add if x not in assets]
sw = re.sub(r"var ASSETS=\[.*?\];", "var ASSETS=" + json.dumps(assets) + ";", sw, flags=re.S)
sw = rep(sw, r"(index\.html|app\.js|data\.js|", r"(index\.html|app\.js|maps\.js|geo\.js|data\.js|")
mm = re.search(r"var CACHE='([a-z0-9-]+)-v(\d+)';", sw)
sw = sw.replace(mm.group(0), f"var CACHE='{mm.group(1)}-v{int(mm.group(2)) + 1}';")
W(p, sw)
print(f"Brunch Doha: Arabic version with {len(ar['brunches'])} brunches, map with {len(GEO)} pins, cache v{int(mm.group(2)) + 1}")

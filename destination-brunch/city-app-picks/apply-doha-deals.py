"""Apply doha-deals-nov2026.py to an unmodified copy of the Happy Hour Doha app (English + Arabic).

Usage: python3 apply-doha-deals.py <unmodified-app-folder> <output-folder> <geo-json>
Adds a "Staff & resident deals" offer type, new offers with map pins, corrections to existing
offers, the new checked date, and bumps the offline cache so phones pick up the change.
"""
import importlib.util, json, os, re, shutil, sys

src, out, geo_path = sys.argv[1], sys.argv[2], sys.argv[3]
here = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("dd", os.path.join(here, "doha-deals-nov2026.py"))
dd = importlib.util.module_from_spec(spec); spec.loader.exec_module(dd)
GEO_BY_PLACE = json.load(open(geo_path, encoding="utf-8"))
GEO_BY_PLACE.setdefault("Dusit Hotel & Suites", [25.3229, 51.532993, "area"])
CHECKED_EN, CHECKED_AR = "18 Nov 2026", "18 نوفمبر 2026"

AREA_AR = {"Doha": "الدوحة", "Lusail": "لوسيل", "Msheireb": "مشيرب", "The Pearl": "اللؤلؤة", "West Bay": "الخليج الغربي",
           "Al Sadd": "السد", "Old Airport": "المطار القديم", "Corniche": "الكورنيش", "Ras Abu Aboud": "رأس أبو عبود"}
GROUP_AR = {"West Bay": "الخليج الغربي", "Lusail": "لوسيل", "Doha": "الدوحة", "Msheireb & Old Doha": "مشيرب والدوحة القديمة",
            "The Pearl & Katara": "اللؤلؤة وكتارا"}
TITLE_AR = {"happy": "ساعة سعيدة", "ladies": "ليلة السيدات", "food": "عرض طعام ومشروبات", "staff": "عرض الموظفين والمقيمين"}
NOTE_AR = "تحقق من التفاصيل مع المكان قبل الذهاب."

STAFF_EN = {"id": "staff", "label": "Staff & resident deals", "short": "Staff deal", "emoji": "🪪", "img": "skyline2",
            "words": ["staff", "industry", "hotelier", "hoteliers", "crew", "teacher", "teachers", "employee", "employees",
                      "resident", "residents", "healthcare", "nurse", "aviation", "id", "qatarenergy", "hospitality"]}
STAFF_AR = dict(STAFF_EN, label="عروض الموظفين والمقيمين", short="عرض موظفين",
                words=STAFF_EN["words"] + ["موظفين", "موظف", "مقيمين", "سكان", "معلمين", "فنادق", "طيران", "ضيافة", "قطر للطاقة"])

def price_ar(t):
    t = t or ""
    for a, b in ((" per lady", " للسيدة"), (" per person", " للشخص"), (" for 2 hours", " لساعتين"), ("from ", "من "),
                 ("under ", "أقل من "), ("% off food", "٪ خصم على الطعام"), ("% off drinks", "٪ خصم على المشروبات"),
                 ("% off", "٪ خصم"), ("up to ", "حتى "), ("free entry", "دخول مجاني"), ("free", "مجانًا"),
                 ("discount", "خصم"), ("2-for-1", "2 بسعر 1"), (" for 2 beers + bite", " لمشروبين ولقمة"),
                 (" for 2 drinks + bite", " لمشروبين ولقمة"), (" for 3 drinks", " لثلاثة مشروبات"), (" unlimited", " بلا حدود"),
                 ("(Sat 190)", "(السبت 190)")):
        t = t.replace(a, b)
    return t

def load(path):
    s = open(path, encoding="utf-8").read()
    i, j = s.index("{"), s.rindex("}") + 1
    return s[:i], json.loads(s[i:j]), s[j:]

def save(path, head, data, tail):
    open(path, "w", encoding="utf-8").write(head + json.dumps(data, ensure_ascii=False, indent=0) + tail)

if os.path.exists(out):
    shutil.rmtree(out)
shutil.copytree(src, out, ignore=shutil.ignore_patterns(".mirror-manifest.json"))

h_en, en, t_en = load(os.path.join(out, "data.js"))
h_ar, ar, t_ar = load(os.path.join(out, "ar/data.js"))
assert len(en["items"]) == len(ar["items"]) and not any(t["id"] == "staff" for t in en["city"]["types"]), "use an unmodified copy"

en["city"]["types"].append(STAFF_EN)
ar["city"]["types"].append(STAFF_AR)
en["checked"], ar["checked"] = CHECKED_EN, CHECKED_AR

for i, upd in dd.UPDATES.items():
    en["items"][i].update(upd)
    ar_upd = {k: v for k, v in upd.items() if k in ("days", "start", "end", "price", "free", "unlimited", "url", "conf")}
    if "notes" in upd:
        ar_upd["notes"] = NOTE_AR if upd["notes"] else ""
    ar_upd.update(dd.AR_UPDATES.get(i, {}))
    ar["items"][i].update(ar_upd)

gs = open(os.path.join(out, "geo.js"), encoding="utf-8").read()
m = re.search(r"window\.GEO=(\{.*?\});", gs, re.S)
GEO = json.loads(m.group(1))

next_id = max(it["id"] for it in en["items"]) + 1
for o in dd.OFFERS:
    (venue, place, area, group, typ, days, start, end, title, offer, price, ptext, free, unl, notes, url, ar_offer) = o
    base = {"venue": venue, "place": place, "type": typ, "days": list(days), "start": start, "end": end, "url": url,
            "price": price, "conf": "conflict" if ("Older listing" in notes or "Reported locally" in notes or "Times not published" in notes) else "guide",
            "free": free, "unlimited": unl, "id": next_id}
    en["items"].append(dict(base, area=area, group=group, title=title, offer=offer, priceText=ptext, notes=notes))
    ar["items"].append(dict(base, area=AREA_AR.get(area, area), group=GROUP_AR[group], title=TITLE_AR[typ] + " · " + title,
                            offer=ar_offer, priceText=price_ar(ptext), notes=NOTE_AR if notes else ""))
    g = GEO_BY_PLACE[place]
    GEO[str(next_id)] = g[:3] if len(g) >= 3 else g
    next_id += 1

save(os.path.join(out, "data.js"), h_en.replace("checked 16 Nov 2026", "checked 18 Nov 2026"), en, t_en)
save(os.path.join(out, "ar/data.js"), h_ar.replace("checked 16 Nov 2026", "checked 18 Nov 2026"), ar, t_ar)
gs = gs.replace(m.group(0), "window.GEO=" + json.dumps(GEO) + ";")
open(os.path.join(out, "geo.js"), "w", encoding="utf-8").write(gs)

# Four offer types: 4 tiles across on desktop, 2x2 on smaller screens
css_add = "\n/* Nov 2026: fourth offer type (Staff & resident deals) */\n.hh-tiles{grid-template-columns:repeat(4,1fr)}\n@media (max-width:860px){.hh-tiles{grid-template-columns:1fr 1fr}}\n"
with open(os.path.join(out, "happy.css"), "a", encoding="utf-8") as f:
    f.write(css_add)

# Checked date shown on the page
for page, a, b in (("index.html", "16 Nov 2026", CHECKED_EN), ("ar/index.html", "16 نوفمبر 2026", CHECKED_AR)):
    p = os.path.join(out, page)
    s = open(p, encoding="utf-8").read()
    open(p, "w", encoding="utf-8").write(s.replace(a, b))

# Offline cache: bump so installed copies refresh
p = os.path.join(out, "sw.js")
sw = open(p, encoding="utf-8").read()
mm = re.search(r"var CACHE='([a-z0-9-]+)-v(\d+)';", sw)
sw = sw.replace(mm.group(0), f"var CACHE='{mm.group(1)}-v{int(mm.group(2)) + 1}';")
open(p, "w", encoding="utf-8").write(sw)

from collections import Counter
print(f"Doha: {len(en['items'])} offers (was {len(en['items']) - len(dd.OFFERS)}): {dict(Counter(i['type'] for i in en['items']))}; cache v{int(mm.group(2)) + 1}")

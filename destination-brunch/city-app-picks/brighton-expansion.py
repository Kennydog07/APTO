"""Expand the Brunch Brighton app to cover Hove, Lancing and Worthing (Nov 2026).

Usage: python3 brighton-expansion.py <unmodified-brunch-brighton-folder> <output-folder>
Then:  python3 build.py <output-folder> <final-folder> brunch-brighton   (adds the pubs/bars/restaurants section)

Adds new brunch listings to data.js, their map pins to geo.js, and updates the page text.
Only venues whose offer could be checked in Nov 2026 are included; see each entry's url.
"""
import json, os, re, shutil, sys

src, out = sys.argv[1], sys.argv[2]
CHECKED = "Nov 2026"

def entry(i, restaurant, name, venue, area, group, sat, sun, price, cuisine, cats, vibes, tags,
          highlights, notice, url, img, scores, drinks):
    """sat/sun: hours text or None if not offered that day. scores: (value, fun, food), 1-5."""
    def day(h):
        return {"name": name, "hours": h, "price": price, "priceText": fmt(price), "alc": "", "url": url,
                "linkLabel": "More info", "deal": None, "cuisine": cuisine, "highlights": highlights,
                "priceScore": scores[0], "notice": notice, "upgrade": "", "priceCheck": {"status": "guide"},
                "excludeFromCheapest": False, "drinks": drinks}
    days = [k for k, h in (("fri", sat), ("sat", sun)) if h]
    first = sat or sun
    e = {"id": i, "name": name, "restaurant": restaurant, "venue": venue, "area": area, "areaGroup": group,
         "hours": first, "price": price, "priceText": fmt(price), "alc": "", "priceScore": scores[0],
         "fun": scores[1], "food": scores[2], "cuisine": cuisine, "cats": cats, "vibes": vibes, "tags": tags,
         "highlights": highlights, "url": url, "linkLabel": "More info", "img": img, "deal": None, "days": days,
         "byDay": {k: day(h) for k, h in (("fri", sat), ("sat", sun)) if h},
         "notice": notice, "upgrade": "", "priceCheck": {"status": "guide"}, "excludeFromCheapest": False,
         "drinks": drinks}
    return e

def fmt(p):
    return "" if p is None else (f"{p:.2f}".rstrip("0").rstrip(".") if p % 1 else str(int(p)))

CAFE = {"status": "none", "label": "À la carte café: no drinks package", "packages": []}
def pkg(name, cats, url, brands=None):
    return {"status": "checked", "label": "", "packages": [
        {"name": name, "categories": cats, "brands": brands or {}, "source": url, "sourceDate": CHECKED}]}

RB = "https://restaurantsbrighton.co.uk/bottomless-brunch-brighton/"
NEW = [
    # (restaurant, name, venue, area, areaGroup, Sat hours, Sun hours, price, cuisine, cats, vibes, tags,
    #  highlights, notice, url, img, (value, fun, food), drinks, geo)
    ("Jo & Co", "Brunch & Prosecco", "Church Road", "Church Road, Hove", "Hove", "Sat 11am-3pm", "Sun 11am-3pm", 33,
     "Aussie & Kiwi-style brunch", ["international"], ["chilled"], ["award"],
     "BRAVO Best Brunch 2026; any brunch dish with a bottle of Prosecco per person",
     "A bottle of Prosecco per person (not bottomless). Served daily 11am-3pm.", RB, "eggs", (4, 3, 5),
     pkg("Brunch dish + bottle of Prosecco", ["Fizz"], RB), [50.827269, -0.16705, "area"]),
    ("Oeuf", "Weekend Brunch", "8 Third Avenue", "Third Avenue, Hove", "Hove", "Sat from 9am", "Sun from 9am", None,
     "Brunch café, famous for its frumpets", ["international"], ["chilled"], ["award"],
     "BRAVO Best Brunch winner in 2024 and 2025; try the frumpets",
     "À la carte; price per dish. Booking recommended. Hours vary between listings, so check before you go.",
     "https://restaurantsbrighton.co.uk/oeuf-cafe-hove/", "croissant", (3, 2, 5), CAFE, [50.825848, -0.170923, "venue"]),
    ("Carne", "Saturday Bottomless Brunch", "63 Church Road", "Church Road, Hove", "Hove", "Sat 12pm-3pm (two sittings)", None, 45,
     "Italian BBQ: steak & eggs, eggs Carne-style", ["steak"], ["chilled"], [],
     "Saturday-only bottomless brunch with a welcome cocktail",
     "Sittings 12-1:30pm and 1:30-3pm, with 90 minutes of drinks. An older menu listed £50pp, so confirm when booking.",
     "https://www.designmynight.com/brighton/restaurants/hove/carne-brighton", "steak", (3, 3, 4),
     pkg("Bottomless (90 minutes)", ["Fizz", "Cocktails"], "https://www.designmynight.com/brighton/restaurants/hove/carne-brighton"),
     [50.827269, -0.16705, "area"]),
    ("Shoreline Coffee + Kitchen", "Weekend Brunch", "339 Kingsway", "Kingsway, Hove seafront", "Hove", "Sat 8am-3pm", "Sun 8am-3pm", None,
     "Seafront café brunch", ["international"], ["chilled", "family"], ["beach"],
     "Seafront café on Hove's Kingsway, voted among the area's best brunches",
     "À la carte; price per dish. Listed as closed on Mondays; check hours before you go.",
     "https://restaurantsbrighton.co.uk/shoreline-cafe/", "breakfast", (3, 2, 4), CAFE, [50.828644, -0.200638, "area"]),
    ("Baked", "Weekend Brunch", "69 Church Road", "Church Road, Hove", "Hove", "Sat 7:30am-4pm", "Sun 7:30am-4pm", None,
     "Café brunch with vegan & gluten-free options", ["international"], ["chilled", "family"], ["vegan"],
     "Laid-back Church Road café; pancake stacks and huevos rancheros",
     "À la carte; price per dish. Dog-friendly. Hours vary between listings, so check before you go.",
     "https://www.visitbrighton.com/food-and-drink/baked-p2684121", "eggs2", (3, 2, 4), CAFE, [50.827418, -0.166878, "venue"]),
    ("Perch on Lancing Beach", "Beach Café Brunch", "28 Brighton Road", "Lancing beach", "Lancing", "Sat 9am-4pm", "Sun 9am-7pm", None,
     "Beach café breakfast & waffles", ["international"], ["chilled", "family"], ["beach"],
     "Beachfront café between Shoreham and Worthing; dog-friendly",
     "À la carte; price per dish. Busy at weekends, so booking is advised.",
     "https://www.opentable.ca/r/perch-on-lancing-beach-lancing", "breakfast", (3, 2, 4), CAFE, [50.819855, -0.324192, "venue"]),
    ("VUDU", "Bottomless Brunch", "17 Warwick Street", "Warwick Street, Worthing", "Worthing", "Sat 11am-2:30pm (last sitting)", "Sun 11am-2:30pm (last sitting)", 39.95,
     "Brunch dishes", ["international"], ["party"], [],
     "Plant-filled restaurant; two hours of drinks with your brunch, seven days a week",
     "Last sitting 2:30pm. Another guide lists £38, so confirm the price when booking.",
     "https://vuduworthing.co.uk/menu/bottomlessbrunch", "cocktail", (3, 4, 3),
     pkg("Bottomless (2 hours)", ["Fizz", "Cocktails", "Beer"], "https://vuduworthing.co.uk/menu/bottomlessbrunch",
         {"Beer": ["Asahi", "Beavertown Neck Oil"], "Cocktails": ["Aperol Spritz", "Hugo", "Mimosa"]}),
     [50.81181, -0.369005, "venue"]),
    ("Harlequin's", "Bottomless Brunch", "20 Chapel Road", "Chapel Road, Worthing", "Worthing", "Sat from 12pm", "Sun from 12pm", 40,
     "Brunch dishes", ["international"], ["party"], [],
     "Bottomless brunch every day from 12pm; premium drinks upgrade available",
     "Formerly Slug & Lettuce. Premium drinks upgrade +£5pp.",
     "https://harlequins-worthing.co.uk/bottomless-brunch/", "eggs", (3, 4, 3),
     {"status": "unknown", "label": "Bottomless drinks: ask the venue for the list", "packages": []},
     [50.812658, -0.370216, "venue"]),
]

if os.path.exists(out):
    shutil.rmtree(out)
shutil.copytree(src, out, ignore=shutil.ignore_patterns(".mirror-manifest.json"))

# data.js
p = os.path.join(out, "data.js")
s = open(p, encoding="utf-8").read()
data = json.loads(s[s.index("{"):s.rindex("}") + 1])
if any(b["restaurant"] == "Jo & Co" for b in data["brunches"]):
    sys.exit("Already expanded: use an unmodified copy.")
start = max(b["id"] for b in data["brunches"]) + 1
geo_add = {}
for n, row in enumerate(NEW):
    *fields, drinks, geo = row
    (restaurant, name, venue, area, group, sat, sun, price, cuisine, cats, vibes, tags, hl, notice, url, img, scores) = fields
    e = entry(start + n, restaurant, name, venue, area, group, sat, sun, price, cuisine, cats, vibes, tags, hl, notice, url, img, scores, drinks)
    data["brunches"].append(e)
    geo_add[str(e["id"])] = geo
header = "/* Brunch Brighton data - Saturday & Sunday brunches in Brighton, Hove, Lancing and Worthing; prices checked Nov 2026. Generated file. */\n"
open(p, "w", encoding="utf-8").write(header + "window.BRUNCH_DATA=" + json.dumps(data, ensure_ascii=False, indent=0) + ";\n")

# geo.js
p = os.path.join(out, "geo.js")
g = open(p, encoding="utf-8").read()
m = re.search(r"window\.GEO=(\{.*?\});", g, re.S)
geo = json.loads(m.group(1)); geo.update(geo_add)
g = g.replace(m.group(0), "window.GEO=" + json.dumps(geo) + ";")
g = re.sub(r'window\.MAP_CITY=\{"q": "Brighton, UK", "c": \[[^\]]*\]\}', 'window.MAP_CITY={"q": "Brighton, UK", "c": [50.822, -0.25]}', g)
open(p, "w", encoding="utf-8").write(g)

# page text
REPL = [
    ("Find your Saturday or Sunday brunch in Brighton</title>", "Find your Saturday or Sunday brunch in Brighton, Hove &amp; Worthing</title>"),
    ("Saturday and Sunday brunches across The Lanes, North Laine, the seafront and Kemptown, with prices",
     "Saturday and Sunday brunches across Brighton, Hove, Lancing and Worthing, from The Lanes to Church Road and the seafront, with prices"),
    ("Every weekend brunch in Brighton, Saturday and Sunday, sorted by what you're craving.",
     "Weekend brunches in Brighton, Hove and along the coast to Worthing, sorted by what you're craving."),
    ("<span class=\"dot\"></span> The Lanes · Seafront · Kemptown", "<span class=\"dot\"></span> Brighton · Hove · Worthing"),
    ("the best brunches in Brighton, with prices", "the best brunches in Brighton, Hove and along the coast to Worthing, with prices"),
]
p = os.path.join(out, "index.html")
h = open(p, encoding="utf-8").read()
for a, b in REPL:
    n = h.count(a)
    if n < 1:
        sys.exit(f"Text not found in index.html: {a[:60]}")
    h = h.replace(a, b)
open(p, "w", encoding="utf-8").write(h)
# area filter order (hard-coded in app.js)
p = os.path.join(out, "app.js")
a = open(p, encoding="utf-8").read()
old_order = 'var order=["The Lanes & North Laine", "Seafront", "Kemptown"];'
if old_order not in a:
    sys.exit("Area order not found in app.js")
a = a.replace(old_order, 'var order=["The Lanes & North Laine", "Seafront", "Kemptown", "Hove", "Lancing", "Worthing"];')
open(p, "w", encoding="utf-8").write(a)
p = os.path.join(out, "manifest.webmanifest")
m = open(p, encoding="utf-8").read()
m = m.replace("Find Saturday and Sunday brunches in Brighton by the food you're craving.",
              "Find Saturday and Sunday brunches in Brighton, Hove and Worthing by the food you're craving.")
open(p, "w", encoding="utf-8").write(m)
print(f"Added {len(NEW)} brunches (ids {start}-{start + len(NEW) - 1}); total {len(data['brunches'])}")

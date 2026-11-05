"""Rebuild shared/data/airports.json from the public-domain OurAirports dataset.

    curl -sSL -o /tmp/airports.csv https://davidmegginson.github.io/ourairports-data/airports.csv
    python3 scripts/build-airports.py /tmp/airports.csv

Selection: every UK / Channel Islands / Isle of Man airport with scheduled service, all large
airports in Europe, the near-Europe holiday countries and the main long-haul countries, the
medium airports in the main holiday countries, and a hand-picked list of hubs elsewhere.
Data: OurAirports (https://ourairports.com/data/), public domain.
"""
import csv, json, sys
from pathlib import Path

EU = set("AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS LI NO CH".split())
HOL = set("ES PT IT GR HR CY MT FR".split())
UK = set("GB GG JE IM".split())
NEAR = set("TR MA EG TN GI AL ME RS BA MK JO IL CV".split())
LONG = set("CA DO JM BB CU BS AE QA SA BH OM KW PK LK MV TH SG MY HK KR AU NZ ZA KE MU BR AR ID VN PH NG GH TZ ET".split())
PICK = {
    "US": "ATL LAX ORD DFW DEN JFK SFO SEA LAS MCO EWR CLT PHX IAH MIA BOS MSP DTW FLL PHL LGA BWI SLC SAN IAD DCA TPA BNA AUS HNL PDX STL MSY RDU SJC OAK SMF MCI SAT CLE PIT IND CMH ANC TUS",
    "CN": "PEK PKX PVG SHA CAN SZX CTU CKG KMG XIY HGH CSX XMN",
    "IN": "DEL BOM BLR MAA HYD CCU COK AMD GOI ATQ TRV",
    "JP": "HND NRT KIX NGO FUK CTS OKA",
    "MX": "MEX CUN GDL MTY SJD PVR",
}

src = sys.argv[1] if len(sys.argv) > 1 else "/tmp/airports.csv"
sel = {}
for r in csv.DictReader(open(src, encoding="utf-8")):
    i, c, t = r["iata_code"], r["iso_country"], r["type"]
    if len(i) != 3 or r["scheduled_service"] != "yes" or t not in ("large_airport", "medium_airport", "small_airport"):
        continue
    if (c in UK or (c in EU | NEAR | LONG and t == "large_airport")
            or (c in HOL and t == "medium_airport") or (c in PICK and i in PICK[c].split())):
        sel[i] = r
out = [
    {"iata": i, "name": r["name"], "city": r["municipality"], "country": r["iso_country"],
     "lat": round(float(r["latitude_deg"]), 4), "lon": round(float(r["longitude_deg"]), 4)}
    for i, r in sorted(sel.items())
]
dest = Path(__file__).resolve().parent.parent / "shared" / "data" / "airports.json"
dest.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"{len(out)} airports -> {dest}")

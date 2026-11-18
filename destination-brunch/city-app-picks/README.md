# "Best pubs, bars & restaurants" add-on for the city apps

Added in November 2026 to the brunch apps with the fewest listings:
Barcelona, Singapore, Hong Kong, Bangkok, Manchester, New York and Brighton.

**Brighton** was also expanded from 8 to 16 brunches to cover Hove, Lancing and Worthing
(`brighton-expansion.py`; run it on an unmodified copy of the app *before* `build.py`).

Each app gets a **Beyond brunch** section after the brunch results, with filter buttons
(All / Bars / Pubs / Restaurants), an "Open in Maps" button per venue, a price level,
and the guides used as sources. On tablets and computers there is also a 🍸 **Eat & drink**
button in the header that jumps to the section.

| File | What it is |
|---|---|
| `picks.json` | **The venue lists.** Edit names, areas, descriptions and price levels (1–4) here. |
| `picks.css`, `picks.js` | The section's look and the filter buttons. |
| `build.py` | Adds the section to an unmodified copy of an app. |

## Updating a list

1. Edit `picks.json`. Only add venues you have checked are open, and update `"checked"`.
2. Download the current live app files, then run:
   `python3 build.py <unmodified-app-folder> <output-folder> brunch-manchester`
3. Deploy the output folder to that app's Netlify project.

## Important if you regenerate an app yourself

The apps were changed by editing their **live** files: `index.html` and `sw.js`, plus the new `picks.css` and `picks.js`.
If you rebuild an app from your own source files, the section disappears unless you run
`build.py` on the result again. To undo the change, open the app in Netlify, go to
**Deploys**, choose the deploy from 17 November 2026 and click **Publish deploy**.

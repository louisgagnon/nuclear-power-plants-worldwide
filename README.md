# Nuclear Power Plants Worldwide — Interactive Map

An interactive world map of **362 nuclear power plant sites** (968 reactor units, 45 countries),
built from the nuclear-power-plants-worldwide.xlsx dataset
(Wikipedia “List of commercial nuclear reactors”, compiling IAEA PRIS data, September 2026).

Each plant is a circle marker: **colour = status** (operating / under construction / planned /
shut down / other), **size = net capacity**. Hover any marker for a summary
(name, location, units, capacity, status, reactor type, owner/operator, annual generation);
click for the full detail panel. Filter by status, or search by plant/country.

## Files (flat layout — no subfolders)

| File | Purpose |
|---|---|
| `index.html` | Page shell |
| `style.css` | Styling |
| `app.js` | Map logic (Leaflet + marker clustering) |
| `plants.json` | All plant data incl. coordinates |
| `README.md` | This file |

No build step, no API keys. The page loads Leaflet from a CDN and `plants.json` locally.
This is the flat-layout variant of the app, packaged so every file can be uploaded
individually through GitHub's web upload (which doesn't accept folders). Functionally
identical to the folder-based version.

## Publish with GitHub Pages (free)

1. Create a new **public** repository on GitHub (e.g. `nuclear-power-plants-worldwide`).
2. On the repo page click **Add file → Upload files** and drag in all five files above,
   then **Commit changes**.
3. Go to **Settings → Pages** → under *Build and deployment*, set **Source** to
   **Deploy from a branch**, branch **main**, folder **/(root)** → Save.
4. After a minute or two the site is live at
   `https://<your-username>.github.io/<repo-name>/`.

## Regenerating the data

The dataset pipeline lives alongside the spreadsheet build scripts:

- `extract_coords.py` — pulls `{{coord}}` lat/lng from each plant's Wikipedia article
- `geocode_missing.py` — geocodes the rest via OpenStreetMap Nominatim
- `build_app_data.py` — merges everything into the plants data file

Run in that order, then copy the fresh `plants.json` here (renamed from `data/plants.json`).

## Data notes

- Coordinates come from Wikipedia infoboxes where available, otherwise OpenStreetMap
  Nominatim. A handful of planned/proposed sites resolve only to city/region level —
  these are flagged `coord_approx: true` in the data and shown with a warning in the app.
- Annual generation years vary by plant (mostly 2016–2024); see the spreadsheet's
  *About* sheet for full caveats.

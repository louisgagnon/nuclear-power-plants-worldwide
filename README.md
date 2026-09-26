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

The page loads Leaflet from a CDN and `plants.json` locally.
This is the flat-layout variant of the app, packaged so every file can be uploaded
individually through GitHub's web upload (which doesn't accept folders). Functionally
identical to the folder-based version.

## Host your own copy with GitHub Pages (free)

The app is a static site — no build step, no server. To publish your own copy:

1. Fork this repository (or download the five files above) into a new **public**
   repository on GitHub. (On a free GitHub account, Pages only publishes from
   public repositories.)
2. Go to **Settings → Pages** → under *Build and deployment*, set **Source** to
   **Deploy from a branch**, branch **main**, folder **/(root)** → Save.
3. Your site will be live at `https://<your-username>.github.io/<repo-name>/`
   within a minute or two.

To run it locally instead, serve the folder over HTTP
(e.g. `python3 -m http.server`) and open the page in your browser —
`plants.json` is loaded with `fetch`, so opening `index.html` straight from
disk won't work in most browsers.

## Regenerating the data

The dataset was built from Wikipedia's "List of commercial nuclear reactors"
(compiling IAEA PRIS data, September 2026):

- Plant and reactor-unit records were parsed from the article's wikitext tables.
- Owner, operator, annual generation, and capacity factor were parsed from each
  plant's Wikipedia infobox.
- Coordinates came from `{{coord}}` templates in each plant's article where
  available; the rest were geocoded with OpenStreetMap Nominatim.

The full build pipeline (Python scripts plus intermediate data files) is kept in
a separate private repository for reference. Re-running it end to end re-hits
the live Wikipedia API and Nominatim.

## Data notes

- Coordinates come from Wikipedia infoboxes where available, otherwise OpenStreetMap
  Nominatim. A handful of planned/proposed sites resolve only to city/region level —
  these are flagged `coord_approx: true` in the data and shown with a warning in the app.
- Annual generation years vary by plant (mostly 2016–2024); see the spreadsheet's
  *About* sheet for full caveats.

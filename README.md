# AU 2026 · Schedule Notebook

Static web app (no server) for Autodesk University 2026:

- **Calendar** – the curated AI/MCP decision calendar, plus any of the 750 catalog sessions you add from the top-right search box.
- **Record page** per session – live speech-to-text transcript (Web Speech API) with a grey Chinese translation under every English line, notes / methodology, local (no-API) summary, optional Claude summary, links and screenshots. Everything is saved to the browser instantly.
- **Overview** – cross-course synthesis of every recorded session (local or Claude).
- **Sync** – optional GitHub token pushes `notes/*.json` to this repo so phone and laptop share the same transcript.

Live: https://yushi219.github.io/AU-Schedule-Notebook/ (GitHub Pages, source = branch `main` / root)

## Run locally

```bash
python -m http.server 8765
# open http://localhost:8765/
```

Or just open `index.html` in Chrome (speech recognition works on file:// in Chrome; GitHub sync needs https/localhost).

## Refresh the catalog

```bash
node scripts/fetch-catalog.mjs   # pulls all sessions from the public AU catalog API
node scripts/build-catalog.mjs   # writes data/catalog.js (+ data/curated.js from ../AU2026-AI-MCP-calendar-v4.html)
```

## Data layout

- `data/catalog.js` – all AU 2026 sessions (code, title, abstract, speakers, time, room, topics).
- `data/curated.js` – the 35 AI/MCP picks with ratings, Chinese titles and my notes.
- `notes/<CODE>.json` – transcript + notes for one session (written by the app when a GitHub token is set).
- `notes/schedule.json` – sessions added/removed + the overview text.
- `notes/img/*.jpg` – screenshots.

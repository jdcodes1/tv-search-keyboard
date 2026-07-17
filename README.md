# TV Search Keyboard

Netflix-style on-screen keyboard where letters dynamically disable based on whether any movies/shows exist with the current prefix. Built with React + Vite + Tailwind, powered by TMDB's search API.

![Demo](https://img.shields.io/badge/demo-live-brightgreen)

## How It Works

As you type, the app checks whether appending each letter A-Z to your current query would return any results. Letters with no matches gray out, narrowing the keyboard in real-time — just like Netflix's TV app.

- Arrow key navigation for TV-like d-pad feel
- Physical keyboard typing also supported
- All queries cached — explored paths resolve instantly
- Works without an API key (mock data fallback)

## Speed

D-pad navigation **skips over disabled letters** — pressing an arrow lands on the
next *enabled* key instead of stepping cell-by-cell. Since typing on a TV means
moving a cursor around the grid, dropping dead-end letters cuts a lot of travel.

Benchmark: shortest-path d-pad presses (arrows + selects) to type every title in
the mock catalog, cursor starting at `A`.

| Keyboard                         | Presses / search | vs. normal   |
| -------------------------------- | ---------------- | ------------ |
| Normal (all letters always live) | 44.0             | —            |
| Disable-only (no skip)           | 44.0             | 0% faster    |
| **Skip disabled (this app)**     | **22.9**         | **~48% fewer** |

Disabling dead-ends *without* skipping saves nothing — the cursor still walks
past them. The win comes entirely from skipping. Reproduce with:

```bash
node bench/dpad_bench.mjs   # the benchmark
node bench/nav.checks.mjs   # navigation unit checks
```

## Setup

```bash
npm install
npm run dev
```

### With real movie data

1. Get a free API key from [TMDB](https://www.themoviedb.org/settings/api)
2. Create `.env`:
   ```
   VITE_TMDB_API_KEY=your_key_here
   ```
3. Restart the dev server

## Tech Stack

- React 19 + Vite
- Tailwind CSS
- TMDB Search API

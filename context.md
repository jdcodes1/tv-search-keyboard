# TV Search Keyboard

Netflix-style on-screen keyboard demo where letters dynamically disable based on whether any movies exist with the current prefix + that letter.

## Architecture
- **React + Vite + Tailwind** — single-page app
- **TMDB API** for movie search (optional, falls back to mock data)
- **tmdb.js** — search + caching layer, `checkLetterAvailability()` fires 26 parallel searches
- **Keyboard.jsx** — 2-row A-Z grid + SPACE/DEL/CLEAR, arrow key navigation
- **SearchBar.jsx** — displays query with blinking cursor + result count
- **ResultsGrid.jsx** — horizontal scrollable poster row
- **App.jsx** — state orchestration, 150ms debounce, physical keyboard support

## Key Design Decisions
- Cache: simple `Map<query, results>` — queries are deterministic, cache never invalidated
- Mock fallback: ~90 hardcoded titles so demo works without API key
- All 26 letters checked in parallel per keystroke (cached paths are free)
- Arrow key navigation for TV-like d-pad feel

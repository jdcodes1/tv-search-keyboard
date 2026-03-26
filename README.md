# TV Search Keyboard

Netflix-style on-screen keyboard where letters dynamically disable based on whether any movies/shows exist with the current prefix. Built with React + Vite + Tailwind, powered by TMDB's search API.

![Demo](https://img.shields.io/badge/demo-live-brightgreen)

## How It Works

As you type, the app checks whether appending each letter A-Z to your current query would return any results. Letters with no matches gray out, narrowing the keyboard in real-time — just like Netflix's TV app.

- Arrow key navigation for TV-like d-pad feel
- Physical keyboard typing also supported
- All queries cached — explored paths resolve instantly
- Works without an API key (mock data fallback)

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

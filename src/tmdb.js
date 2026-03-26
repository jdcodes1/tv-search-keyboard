const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
const cache = new Map()

const MOCK_TITLES = [
  'Prison Break', 'Pride and Prejudice', 'Primer', 'Prince of Egypt',
  'Private Ryan', 'Primal Fear', 'Pretty Woman', 'Predator',
  'Press Play', 'Prometheus', 'Pulp Fiction', 'Puzzle',
  'Pacific Rim', 'Parasite', 'Passengers', 'Patton',
  'Blade Runner', 'Black Panther', 'Blue Velvet', 'Braveheart',
  'Cast Away', 'Casablanca', 'Cars', 'Captain Marvel',
  'Dark Knight', 'Dune', 'Drive', 'Django Unchained',
  'Eternal Sunshine', 'Everything Everywhere All at Once',
  'Fight Club', 'Frozen', 'Finding Nemo', 'Forrest Gump',
  'Gladiator', 'Gravity', 'Gone Girl', 'Get Out',
  'Harry Potter', 'Her', 'Hugo', 'Heat',
  'Inception', 'Interstellar', 'Iron Man', 'Inside Out',
  'Joker', 'Jaws', 'Jurassic Park', 'John Wick',
  'Kill Bill', 'King Kong', 'Knives Out',
  'La La Land', 'Logan', 'Lord of the Rings', 'Life of Pi',
  'Mad Max', 'Matrix', 'Moana', 'Moonlight',
  'Nightcrawler', 'No Country for Old Men', 'Nomadland',
  'Oppenheimer', 'Once Upon a Time in Hollywood',
  'Ratatouille', 'Rocky', 'Rush Hour', 'Rear Window',
  'Spirited Away', 'Star Wars', 'Spider-Man', 'Shrek',
  'Titanic', 'Top Gun', 'Toy Story', 'The Godfather',
  'Up', 'Unbreakable', 'Us',
  'Venom', 'Vertigo', 'V for Vendetta',
  'Wall-E', 'Whiplash', 'Wonder Woman', 'Wicked',
  'X-Men', 'Yesterday', 'Zootopia', 'Zodiac',
]

function mockSearch(query) {
  if (!query) return []
  const q = query.toLowerCase()
  return MOCK_TITLES
    .filter(t => t.toLowerCase().startsWith(q))
    .map((title, i) => ({
      id: i,
      title,
      poster_path: null,
    }))
}

function titleMatchesQuery(title, query) {
  const t = title.toLowerCase()
  const q = query.toLowerCase()
  // Check if query matches starting from any word boundary in the title
  if (t.startsWith(q)) return true
  for (let i = 1; i < t.length; i++) {
    if (t[i - 1] === ' ' && t.substring(i).startsWith(q)) return true
  }
  return false
}

export async function searchMovies(query) {
  if (!query) return []
  const key = query.toLowerCase().trim()
  if (cache.has(key)) return cache.get(key)

  if (!API_KEY) {
    const results = mockSearch(key)
    cache.set(key, results)
    return results
  }

  try {
    const res = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`
    )
    const data = await res.json()
    const results = (data.results || [])
      .map(m => ({
        id: m.id,
        title: m.title,
        poster_path: m.poster_path,
      }))
      .filter(m => titleMatchesQuery(m.title, key))
    cache.set(key, results)
    return results
  } catch {
    const results = mockSearch(key)
    cache.set(key, results)
    return results
  }
}

export async function checkLetterAvailability(prefix) {
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
  const availability = {}

  const checks = letters.map(async (letter) => {
    const results = await searchMovies(prefix + letter)
    availability[letter] = results.length > 0
  })

  await Promise.all(checks)
  return availability
}

export function getPosterUrl(path) {
  if (!path) return null
  return `https://image.tmdb.org/t/p/w200${path}`
}

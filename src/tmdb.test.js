import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getPosterUrl, searchMovies } from './tmdb.js'

describe('getPosterUrl', () => {
  it('returns null for an empty path', () => {
    expect(getPosterUrl(null)).toBe(null)
    expect(getPosterUrl('')).toBe(null)
  })

  it('builds a full TMDB image URL from a poster path', () => {
    expect(getPosterUrl('/abc.jpg')).toBe('https://image.tmdb.org/t/p/w200/abc.jpg')
  })
})

describe('searchMovies (mock mode, no API key)', () => {
  it('returns an empty array for an empty query', async () => {
    expect(await searchMovies('')).toEqual([])
  })

  it('returns titles that start with the query, case-insensitively', async () => {
    const res = await searchMovies('Pr')
    expect(res.length).toBeGreaterThan(0)
    expect(res.every((m) => m.title.toLowerCase().startsWith('pr'))).toBe(true)
    expect(res.map((m) => m.title)).toContain('Prison Break')
  })

  it('returns an empty array when nothing matches', async () => {
    expect(await searchMovies('zzzz')).toEqual([])
  })
})

describe('searchMovies (real API path)', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('builds the correct search URL and parses + filters the response', async () => {
    vi.stubEnv('VITE_TMDB_API_KEY', 'test-key')
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        results: [
          { id: 1, title: 'Inception', poster_path: '/a.jpg', extra: 'ignored' },
          { id: 2, title: 'Zzz No Match', poster_path: '/b.jpg' },
        ],
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { searchMovies: sm } = await import('./tmdb.js')
    const res = await sm('inc')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const url = fetchMock.mock.calls[0][0]
    expect(url).toContain('https://api.themoviedb.org/3/search/movie')
    expect(url).toContain('api_key=test-key')
    expect(url).toContain('query=inc')
    expect(url).toContain('page=1')

    // Only the matching title is kept, mapped to the trimmed shape.
    expect(res).toEqual([{ id: 1, title: 'Inception', poster_path: '/a.jpg' }])
  })

  it('URL-encodes special characters in the query', async () => {
    vi.stubEnv('VITE_TMDB_API_KEY', 'k')
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ results: [] }) })
    vi.stubGlobal('fetch', fetchMock)

    const { searchMovies: sm } = await import('./tmdb.js')
    await sm('a b&c')

    expect(fetchMock.mock.calls[0][0]).toContain('query=a%20b%26c')
  })

  it('falls back to mock data when fetch throws', async () => {
    vi.stubEnv('VITE_TMDB_API_KEY', 'k')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    const { searchMovies: sm } = await import('./tmdb.js')
    const res = await sm('pr')

    expect(res.map((m) => m.title)).toContain('Prison Break')
  })
})

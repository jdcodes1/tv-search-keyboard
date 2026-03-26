import { useState, useEffect, useCallback, useRef } from 'react'
import { searchMovies, checkLetterAvailability } from './tmdb'
import Keyboard from './Keyboard'
import SearchBar from './SearchBar'
import ResultsGrid from './ResultsGrid'

export default function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [availableLetters, setAvailableLetters] = useState({})
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  const updateResults = useCallback(async (q) => {
    setLoading(true)
    try {
      const [res, available] = await Promise.all([
        searchMovies(q),
        checkLetterAvailability(q),
      ])
      setResults(res)
      setAvailableLetters(available)
    } catch {
      setResults([])
      setAvailableLetters({})
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!query) {
      setResults([])
      setAvailableLetters({})
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => updateResults(query), 150)

    return () => clearTimeout(debounceRef.current)
  }, [query, updateResults])

  const handleKeyPress = useCallback((key) => {
    if (key === 'DEL') {
      setQuery(q => q.slice(0, -1))
    } else if (key === 'CLEAR') {
      setQuery('')
    } else {
      setQuery(q => q + key)
    }
  }, [])

  // Physical keyboard support
  useEffect(() => {
    const handlePhysicalKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'Backspace') {
        e.preventDefault()
        handleKeyPress('DEL')
      } else if (/^[a-zA-Z ]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        const letter = e.key.toLowerCase()
        if (letter === ' ') {
          handleKeyPress(' ')
        } else if (availableLetters[letter] !== false) {
          handleKeyPress(letter)
        }
      }
    }
    window.addEventListener('keydown', handlePhysicalKey)
    return () => window.removeEventListener('keydown', handlePhysicalKey)
  }, [handleKeyPress, availableLetters])

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-1 mt-4">TV Search Keyboard</h1>
      <p className="text-slate-500 text-sm mb-8">
        Netflix-style predictive keyboard — letters gray out when no results match
      </p>

      <div className="w-full max-w-2xl">
        <SearchBar query={query} resultCount={results.length} loading={loading} />
        <Keyboard
          availableLetters={availableLetters}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <ResultsGrid results={results} />
      </div>

      <div className="mt-auto pt-8 text-xs text-slate-700 text-center">
        {import.meta.env.VITE_TMDB_API_KEY
          ? 'Powered by TMDB API'
          : 'Using mock data — add VITE_TMDB_API_KEY to .env for real results'
        }
      </div>
    </div>
  )
}

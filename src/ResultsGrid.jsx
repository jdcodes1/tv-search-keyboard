import { getPosterUrl } from './tmdb'

export default function ResultsGrid({ results }) {
  if (!results.length) return null

  return (
    <div>
      <div className="text-sm text-slate-400 mb-3 uppercase tracking-wider">Results</div>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
        {results.map((movie) => (
          <div key={movie.id} className="flex-shrink-0 w-32">
            {movie.poster_path ? (
              <img
                src={getPosterUrl(movie.poster_path)}
                alt={movie.title}
                className="w-32 h-48 object-cover rounded-lg bg-slate-800"
                loading="lazy"
              />
            ) : (
              <div className="w-32 h-48 rounded-lg bg-slate-800 flex items-center justify-center text-slate-600 text-xs text-center px-2">
                {movie.title}
              </div>
            )}
            <div className="text-xs text-slate-400 mt-1.5 truncate">{movie.title}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

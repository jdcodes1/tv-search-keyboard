export default function SearchBar({ query, resultCount, loading }) {
  return (
    <div className="mb-8">
      <div className="text-sm text-slate-400 mb-2 uppercase tracking-wider">Search</div>
      <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-5 py-4 text-2xl font-mono min-h-[60px]">
        <span className="text-white tracking-widest">
          {query.toUpperCase() || ''}
        </span>
        <span className="cursor-blink text-red-500 ml-0.5 font-bold">▎</span>
        <div className="ml-auto text-sm text-slate-500 font-sans">
          {loading ? (
            <span className="text-yellow-500">searching...</span>
          ) : query ? (
            `${resultCount} result${resultCount !== 1 ? 's' : ''}`
          ) : (
            'type to search'
          )}
        </div>
      </div>
    </div>
  )
}

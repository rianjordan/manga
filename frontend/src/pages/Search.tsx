import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMangaSearch } from '../hooks/useManga'
import { MangaCard } from '../components/ui/MangaCard'
import type { Manga } from '../lib/types'

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Thriller',
]

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [page, setPage] = useState(1)

  const query = searchParams.get('q') ?? ''
  const limit = 20

  const { data, isLoading } = useMangaSearch({
    title: query || undefined,
    limit,
    offset: (page - 1) * limit,
    includedTags: selectedGenres.length > 0 ? undefined : undefined, // Would need actual tag IDs
    order: { relevance: 'desc' },
    hasAvailableChapters: true,
    contentRating: ['safe', 'suggestive'],
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams(searchInput ? { q: searchInput } : {})
    setPage(1)
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    )
    setPage(1)
  }

  const totalPages = data ? Math.ceil(data.total / limit) : 0

  return (
    <div className="flex flex-col gap-8">
      {/* Search Header */}
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-6">
          Search
        </h1>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title..."
              className="w-full bg-card border border-gray-700/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-accent hover:bg-pink-500 text-dark font-bold px-6 py-3 rounded-xl text-sm tracking-wide transition-all"
          >
            SEARCH
          </button>
        </form>
      </div>

      {/* Genre Filters */}
      <div className="flex flex-wrap gap-2">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => toggleGenre(genre)}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all duration-300 ${
              selectedGenres.includes(genre)
                ? 'bg-accent text-dark shadow-lg shadow-accent/20'
                : 'bg-card text-muted hover:text-accent border border-gray-700/50'
            }`}
          >
            {genre.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {query && (
            <p className="text-muted text-sm">
              {data?.total ?? 0} results for "<span className="text-white">{query}</span>"
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {data?.data.map((manga: Manga, i: number) => (
              <MangaCard key={manga.id} manga={manga} index={i} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 rounded-xl bg-card border border-gray-700/50 text-muted hover:text-accent disabled:opacity-30 transition-all flex items-center justify-center"
              >
                <i className="fa-solid fa-chevron-left text-sm" />
              </button>
              <span className="text-sm text-muted font-bold">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-10 h-10 rounded-xl bg-card border border-gray-700/50 text-muted hover:text-accent disabled:opacity-30 transition-all flex items-center justify-center"
              >
                <i className="fa-solid fa-chevron-right text-sm" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

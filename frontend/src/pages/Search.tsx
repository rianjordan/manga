import { useState, useEffect } from 'react'
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
  const type = searchParams.get('type') ?? ''
  const limit = 20

  useEffect(() => {
    // Reset page on search or type change
    setPage(1)
  }, [query, type])

  const searchParamsObj: any = {
    title: query || undefined,
    limit,
    offset: (page - 1) * limit,
    order: { relevance: 'desc' },
    hasAvailableChapters: true,
    contentRating: ['safe', 'suggestive'],
  }

  if (type === 'manhwa') {
    searchParamsObj.originalLanguage = ['ko']
  } else if (type === 'manga') {
    searchParamsObj.originalLanguage = ['ja']
  } else if (type === 'novel') {
    searchParamsObj.includedTags = ['f9aa23da-a38b-4fb0-b359-8576dbb9d4d8']
  }

  const { data, isLoading } = useMangaSearch(searchParamsObj)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const nextParams: Record<string, string> = {}
    if (searchInput.trim()) nextParams.q = searchInput.trim()
    if (type) nextParams.type = type
    setSearchParams(nextParams)
    setPage(1)
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    )
    setPage(1)
  }

  const totalPages = data ? Math.ceil(data.total / limit) : 0

  const getPageTitle = () => {
    if (type === 'manhwa') return 'Explore Manhwa'
    if (type === 'manga') return 'Explore Manga'
    if (type === 'novel') return 'Explore Novels'
    return 'Explore Catalog'
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Search Header */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-8 bg-accent rounded-full" />
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            {getPageTitle()}
          </h1>
        </div>

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
            className="bg-accent hover:bg-pink-500 text-dark font-bold px-6 py-3 rounded-xl text-sm tracking-wide transition-all cursor-pointer"
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
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all duration-300 cursor-pointer ${
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

          {data?.data.length === 0 ? (
            <div className="text-center py-20 text-muted">
              No manga found matching your filters.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {data?.data.map((manga: Manga, i: number) => (
                <MangaCard key={manga.id} manga={manga} index={i} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-end items-center mt-8 gap-4">
              <div className="flex items-center gap-2 pr-4 border-r border-gray-800/60 mr-2">
                <span className="text-muted text-xs font-bold uppercase tracking-widest">Page</span>
                <span className="text-white font-black text-sm">
                  {String(page).padStart(2, '0')}{' '}
                  <span className="text-muted/40 mx-1">/</span>{' '}
                  {String(Math.min(totalPages, 10)).padStart(2, '0')}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="group w-12 h-12 rounded-2xl bg-card border border-gray-800/60 text-muted hover:text-accent hover:border-accent/50 transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-accent/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Previous page"
                >
                  <i className="fa-solid fa-arrow-left text-sm transition-transform group-hover:-translate-x-1" />
                </button>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="group w-12 h-12 rounded-2xl bg-card border border-gray-800/60 text-muted hover:text-accent hover:border-accent/50 transition-all duration-300 flex items-center justify-center shadow-xl hover:shadow-accent/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Next page"
                >
                  <i className="fa-solid fa-arrow-right text-sm transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMangaSearch } from '../hooks/useManga'
import { MangaCard } from '../components/ui/MangaCard'
import type { Manga } from '../lib/types'

const TAGS = [
  { name: 'Action', id: '391b0423-d847-456f-aff0-8b0cfc03066b' },
  { name: 'Adventure', id: '87cc8738-d6a3-4c37-bc7e-975f8a851b6a' },
  { name: 'Comedy', id: '4d32b4b2-db87-4835-ab35-230d474ab53e' },
  { name: 'Drama', id: 'b9caf13e-d60e-40cc-9d47-b51c5b1d7fc1' },
  { name: 'Fantasy', id: 'cdc58593-397d-415e-8137-ef0276d3faf6' },
  { name: 'Horror', id: 'cdad8346-bf4b-44b2-a34e-a18d360ef5a6' },
  { name: 'Mystery', id: 'ee96342f-d653-402b-8e3d-16a85590c753' },
  { name: 'Romance', id: '423e2eae-9779-4140-abf1-288280ebab6d' },
  { name: 'Sci-Fi', id: '256c8164-e0c8-4395-963d-a03fb4032d67' },
  { name: 'Slice of Life', id: 'e5301a23-ebd9-49dd-a0cb-2add944c7fe9' },
  { name: 'Sports', id: '6995f692-21c3-49a8-9b7e-e17f8d6f8538' },
  { name: 'Thriller', id: '07251b12-9c98-444f-9b0d-b4b1a457a43f' },
]

const DEMOGRAPHICS = [
  { name: 'Shounen', id: 'shounen' },
  { name: 'Shoujo', id: 'shoujo' },
  { name: 'Seinen', id: 'seinen' },
  { name: 'Josei', id: 'josei' },
]

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')
  const [includedTags, setIncludedTags] = useState<string[]>([])
  const [excludedTags, setExcludedTags] = useState<string[]>([])
  const [selectedDemographics, setSelectedDemographics] = useState<string[]>([])
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
    includedTags: includedTags.length > 0 ? includedTags : undefined,
    excludedTags: excludedTags.length > 0 ? excludedTags : undefined,
    publicationDemographic: selectedDemographics.length > 0 ? selectedDemographics : undefined,
  }

  if (type === 'manhwa') {
    searchParamsObj.originalLanguage = ['ko']
  } else if (type === 'manga') {
    searchParamsObj.originalLanguage = ['ja']
  } else if (type === 'novel') {
    const novelTag = 'f9aa23da-a38b-4fb0-b359-8576dbb9d4d8'
    searchParamsObj.includedTags = [novelTag, ...includedTags]
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

  const handleTagClick = (tagId: string) => {
    if (includedTags.includes(tagId)) {
      // Transition from Included to Excluded
      setIncludedTags((prev) => prev.filter((id) => id !== tagId))
      setExcludedTags((prev) => [...prev, tagId])
    } else if (excludedTags.includes(tagId)) {
      // Transition from Excluded to Neutral
      setExcludedTags((prev) => prev.filter((id) => id !== tagId))
    } else {
      // Transition from Neutral to Included
      setIncludedTags((prev) => [...prev, tagId])
    }
    setPage(1)
  }

  const toggleDemographic = (demo: string) => {
    setSelectedDemographics((prev) =>
      prev.includes(demo) ? prev.filter((d) => d !== demo) : [...prev, demo],
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
              className="w-full bg-card border border-gray-700/50 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-accent hover:bg-pink-500 text-dark font-black px-8 py-3.5 rounded-xl text-sm tracking-wide transition-all cursor-pointer shadow-lg shadow-accent/20"
          >
            SEARCH
          </button>
        </form>
      </div>

      {/* Advanced Tag Filter Panel */}
      <div className="flex flex-col gap-5 bg-card/45 p-6 rounded-2xl border border-gray-800/40 backdrop-blur-md">
        {/* Demographics row */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-black uppercase text-accent tracking-widest">
            Target Demographic
          </span>
          <div className="flex flex-wrap gap-2.5">
            {DEMOGRAPHICS.map((demo) => (
              <button
                key={demo.id}
                onClick={() => toggleDemographic(demo.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  selectedDemographics.includes(demo.id)
                    ? 'bg-accent text-dark font-black shadow-lg shadow-accent/20'
                    : 'bg-card text-muted hover:text-accent border border-gray-800/60'
                }`}
              >
                {demo.name}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-gray-800/40" />

        {/* Genres Tricolor Grid */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-black uppercase text-accent tracking-widest">
              Advanced Genres Filters
            </span>
            <div className="flex gap-4 text-[10px] font-bold text-muted uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Included</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Excluded</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-600" /> Neutral</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {TAGS.map((tag) => {
              const isIncluded = includedTags.includes(tag.id)
              const isExcluded = excludedTags.includes(tag.id)

              let btnClass = 'bg-[#202020] text-muted border border-gray-800/60 hover:text-accent hover:border-accent/40'
              let icon = null

              if (isIncluded) {
                btnClass = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                icon = <i className="fa-solid fa-plus text-[9px] mr-1.5 text-emerald-400" />
              } else if (isExcluded) {
                btnClass = 'bg-rose-500/10 text-rose-400 border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                icon = <i className="fa-solid fa-minus text-[9px] mr-1.5 text-rose-400" />
              }

              return (
                <button
                  key={tag.id}
                  onClick={() => handleTagClick(tag.id)}
                  className={`px-3 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wide transition-all duration-300 cursor-pointer flex items-center justify-center ${btnClass}`}
                >
                  {icon}
                  {tag.name}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 min-h-[40vh]">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {query && (
            <p className="text-muted text-sm font-semibold">
              {data?.total ?? 0} results for "<span className="text-accent">{query}</span>"
            </p>
          )}

          {data?.data.length === 0 ? (
            <div className="text-center py-20 text-muted font-bold min-h-[40vh] flex flex-col items-center justify-center gap-3">
              <i className="fa-solid fa-folder-open text-3xl opacity-30" />
              No manga found matching your advanced filters.
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

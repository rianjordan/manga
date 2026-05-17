import { useState } from 'react'
import { useFollows } from '../store/user-data'
import { useReadingHistory } from '../store/user-data'
import { useMangaSearch } from '../hooks/useManga'
import { MangaCard } from '../components/ui/MangaCard'
import { Link } from 'react-router-dom'
import type { Manga } from '../lib/types'

const statusTabs = [
  { id: 'all', label: 'All', icon: 'fa-solid fa-layer-group' },
  { id: 'reading', label: 'Reading', icon: 'fa-solid fa-book-open' },
  { id: 'plan_to_read', label: 'Plan to Read', icon: 'fa-solid fa-clock' },
  { id: 'completed', label: 'Completed', icon: 'fa-solid fa-check-circle' },
  { id: 'on_hold', label: 'On Hold', icon: 'fa-solid fa-pause' },
  { id: 'dropped', label: 'Dropped', icon: 'fa-solid fa-trash' },
  { id: 're_reading', label: 'Re-Reading', icon: 'fa-solid fa-rotate' },
]

const sortOptions = [
  { id: 'recent', label: 'Recently Added' },
  { id: 'alpha', label: 'Alphabetical' },
]

export function LibraryPage() {
  const { follows } = useFollows()
  const { history } = useReadingHistory()
  const [activeTab, setActiveTab] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const allMangaIds = Object.keys(follows)
  const filteredIds = activeTab === 'all'
    ? allMangaIds
    : allMangaIds.filter((id) => follows[id]?.status === activeTab)

  const { data, isLoading } = useMangaSearch({
    ids: filteredIds.length > 0 ? filteredIds : ['00000000-0000-0000-0000-000000000000'],
    limit: 100,
  })

  const hasFollows = filteredIds.length > 0
  let libraryList = hasFollows ? data?.data ?? [] : []

  // Sort
  if (sortBy === 'alpha') {
    libraryList = [...libraryList].sort((a, b) => {
      const titleA = a.attributes.title.en ?? Object.values(a.attributes.title)[0] ?? ''
      const titleB = b.attributes.title.en ?? Object.values(b.attributes.title)[0] ?? ''
      return titleA.localeCompare(titleB)
    })
  }

  // Stats
  const totalManga = allMangaIds.length
  const totalChaptersRead = history.length
  const readingCount = allMangaIds.filter((id) => follows[id]?.status === 'reading').length

  return (
    <div className="flex flex-col gap-6 min-h-[60vh]">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gray-800/40 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-accent rounded-full" />
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            My Library
          </h1>
          <span className="text-muted text-sm font-semibold bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            {totalManga} Saved
          </span>
        </div>
        {/* View Mode Toggle */}
        <div className="hidden sm:flex items-center gap-1 bg-card border border-gray-800/40 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg text-xs transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-accent text-dark' : 'text-muted hover:text-white'}`}
            aria-label="Grid view"
          >
            <i className="fa-solid fa-grid-2" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg text-xs transition-all cursor-pointer ${viewMode === 'list' ? 'bg-accent text-dark' : 'text-muted hover:text-white'}`}
            aria-label="List view"
          >
            <i className="fa-solid fa-list" />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      {totalManga > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card/40 border border-gray-800/40 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-white">{totalManga}</div>
            <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Total Manga</div>
          </div>
          <div className="bg-card/40 border border-gray-800/40 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-emerald-400">{readingCount}</div>
            <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Currently Reading</div>
          </div>
          <div className="bg-card/40 border border-gray-800/40 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-sky-400">{totalChaptersRead}</div>
            <div className="text-[10px] font-bold text-muted uppercase tracking-wider">Chapters Read</div>
          </div>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => {
          const count = tab.id === 'all'
            ? allMangaIds.length
            : allMangaIds.filter((id) => follows[id]?.status === tab.id).length
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-accent text-dark shadow-md shadow-accent/25'
                  : 'bg-card text-muted hover:text-white border border-gray-800/40'
              }`}
            >
              <i className={`${tab.icon} text-[10px]`} />
              <span>{tab.label}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-dark/20 text-dark' : 'bg-white/10 text-muted'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Sort Bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted font-semibold">
          {libraryList.length} result{libraryList.length !== 1 ? 's' : ''}
        </span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-card border border-gray-800/40 text-white text-xs font-bold px-3 py-2 rounded-xl outline-none cursor-pointer focus:border-accent"
        >
          {sortOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Grid Content */}
      {isLoading && hasFollows ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[3/4]" />
          ))}
        </div>
      ) : !hasFollows || libraryList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-accent/10 border border-accent/20 text-accent rounded-full flex items-center justify-center mb-6 text-2xl shadow-lg shadow-accent/5">
            <i className="fa-regular fa-bookmark" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {activeTab === 'all' ? 'Your Library is Empty' : `No ${statusTabs.find(t => t.id === activeTab)?.label ?? ''} Manga`}
          </h3>
          <p className="text-muted text-sm leading-relaxed mb-6">
            {activeTab === 'all'
              ? "You haven't followed any manga yet. Bookmark manga you love to save them here!"
              : 'No manga with this status. Try browsing and updating your reading status!'}
          </p>
          <Link
            to="/search"
            className="bg-accent hover:bg-pink-500 text-dark font-black px-6 py-3 rounded-xl text-sm tracking-wide transition-all shadow-lg shadow-accent/20"
          >
            DISCOVER MANGA
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {libraryList.map((manga: Manga, i: number) => (
            <MangaCard key={manga.id} manga={manga} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {libraryList.map((manga: Manga) => {
            const title = manga.attributes.title.en ?? Object.values(manga.attributes.title)[0] ?? 'Untitled'
            const coverRel = manga.relationships.find((r) => r.type === 'cover_art')
            const coverFile = coverRel?.attributes?.fileName as string | undefined
            const status = follows[manga.id]?.status ?? ''

            return (
              <Link
                key={manga.id}
                to={`/manga/${manga.id}`}
                className="flex items-center gap-4 bg-card/40 border border-gray-800/40 rounded-xl p-3 hover:bg-card/60 hover:border-accent/30 transition-all group"
              >
                {coverFile && (
                  <img
                    src={`https://uploads.mangadex.org/covers/${manga.id}/${coverFile}.256.jpg`}
                    alt={title}
                    className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                    loading="lazy"
                  />
                )}
                <div className="flex-grow min-w-0">
                  <h4 className="font-bold text-sm text-white truncate group-hover:text-accent transition-colors">{title}</h4>
                  <span className="text-xs text-muted capitalize">{manga.attributes.status?.replace('_', ' ')}</span>
                </div>
                <span className="text-[10px] font-bold text-accent/70 uppercase tracking-wider flex-shrink-0 hidden sm:block">
                  {status.replace('_', ' ')}
                </span>
                <i className="fa-solid fa-chevron-right text-muted/30 group-hover:text-accent transition-colors text-xs" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

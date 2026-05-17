import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMangaSearch } from '../hooks/useManga'
import { MangaCard } from '../components/ui/MangaCard'
import type { Manga, Tag } from '../lib/types'
import { coverUrl } from '../services/manga'
import { useReadingHistory } from '../store/user-data'

export function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeTab, setActiveTab] = useState<'latest' | 'popular' | 'completed'>('latest')
  const [page, setPage] = useState(1)
  const limit = 20

  const { getRecent } = useReadingHistory()
  const recentHistory = getRecent(5)

  // Featured carousel manga
  const { data: latestData, isLoading: latestLoading, isError: latestError } = useMangaSearch({
    limit: 5,
    order: { followedCount: 'desc' },
    hasAvailableChapters: true,
    contentRating: ['safe', 'suggestive'],
  })

  // Dynamic search params for the updates grid
  const searchParams: any = {
    limit,
    offset: (page - 1) * limit,
    hasAvailableChapters: true,
    contentRating: ['safe', 'suggestive'],
  }

  if (activeTab === 'latest') {
    searchParams.order = { updatedAt: 'desc' }
  } else if (activeTab === 'popular') {
    searchParams.order = { followedCount: 'desc' }
  } else if (activeTab === 'completed') {
    searchParams.order = { followedCount: 'desc' }
    searchParams.status = ['completed']
  }

  const { data: trendingData, isLoading: trendingLoading, isError: trendingError } = useMangaSearch(searchParams)

  const featured = latestData?.data ?? []
  const trending = trendingData?.data ?? []
  const totalPages = trendingData ? Math.ceil(trendingData.total / limit) : 0

  useEffect(() => {
    if (featured.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(featured.length, 5))
    }, 6000)
    return () => clearInterval(interval)
  }, [featured.length])

  // Show full page skeleton only on initial mount when we don't have featured carousel data yet
  if (latestLoading && featured.length === 0) {
    return (
      <div className="flex flex-col gap-10">
        {/* Skeleton Carousel */}
        <div className="w-full h-[450px] bg-card/45 rounded-2xl animate-pulse border border-gray-800/40" />
        
        {/* Skeleton Grid */}
        <section>
          <div className="h-8 w-48 bg-card/60 rounded-lg mb-6 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-card/40 rounded-xl animate-pulse border border-gray-800/40" />
            ))}
          </div>
        </section>
      </div>
    )
  }

  if (latestError || trendingError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-card/25 border border-gray-800/50 rounded-2xl backdrop-blur-sm max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full flex items-center justify-center mb-6 text-2xl shadow-lg shadow-red-500/5">
          <i className="fa-solid fa-triangle-exclamation" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">MangaDex API Connection Blocked</h3>
        <p className="text-muted text-sm leading-relaxed mb-6">
          The backend server could not establish a connection to the MangaDex API from your local network. This is commonly caused by local ISP firewalls, DNS restrictions, or outdated SSL root certificates.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <a 
            href="https://1.1.1.1/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-accent hover:bg-pink-500 text-dark font-bold px-6 py-2.5 rounded-xl text-xs tracking-wider transition-all shadow-md shadow-accent/20"
          >
            <i className="fa-solid fa-shield-halved mr-1.5" /> TRY CLOUDFLARE WARP
          </a>
          <button 
            onClick={() => window.location.reload()}
            className="border border-gray-800 hover:bg-white/5 text-gray-300 font-bold px-6 py-2.5 rounded-xl text-xs tracking-wider transition-all"
          >
            <i className="fa-solid fa-rotate mr-1.5" /> REFRESH PAGE
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Hero Carousel */}
      {featured.length > 0 && (
        <div className="relative group h-[750px] sm:h-[650px] md:h-[550px] w-full overflow-hidden rounded-2xl border border-gray-800/40 shadow-2xl hero-carousel-container">
          {featured.slice(0, 5).map((manga, idx) => (
            <div
              key={manga.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === currentSlide
                  ? 'opacity-100 z-10 pointer-events-auto'
                  : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <HeroSlide manga={manga} />
            </div>
          ))}
          
          {/* Navigation Arrows */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + Math.min(featured.length, 5)) % Math.min(featured.length, 5))}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-accent hover:text-dark text-white border border-gray-800/40 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xl cursor-pointer z-20"
            aria-label="Previous slide"
          >
            <i className="fa-solid fa-chevron-left text-lg" />
          </button>
          
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % Math.min(featured.length, 5))}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-accent hover:text-dark text-white border border-gray-800/40 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xl cursor-pointer z-20"
            aria-label="Next slide"
          >
            <i className="fa-solid fa-chevron-right text-lg" />
          </button>
          
          {/* Pagination Indicators - aligned bottom-right to prevent button overlap */}
          <div className="absolute bottom-6 right-6 md:right-12 flex gap-2.5 z-20 bg-black/45 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/5">
            {Array.from({ length: Math.min(featured.length, 5) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlide ? 'bg-accent w-6' : 'bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recently Read History */}
      {recentHistory.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-gray-800/40 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-accent rounded-full" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Recently Read</h2>
            </div>
            <span className="text-xs text-muted font-semibold uppercase tracking-wider">
              {recentHistory.length} manga in history
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {recentHistory.map((entry) => (
              <div
                key={entry.chapterId}
                className="relative bg-card/65 backdrop-blur-md rounded-2xl p-3 border border-gray-800/40 flex gap-4 hover:border-accent/40 transition-all duration-300 group"
              >
                {/* Cover art image */}
                <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <img
                    src={coverUrl(entry.mangaId, entry.coverFile)}
                    alt={entry.mangaTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/img/website/cover-placeholder.jpg'
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>

                {/* Details */}
                <div className="flex flex-col justify-between py-1 min-w-0 flex-grow">
                  <div className="min-w-0">
                    <Link
                      to={`/manga/${entry.mangaId}`}
                      className="font-bold text-sm text-white hover:text-accent transition-colors line-clamp-1 block"
                      title={entry.mangaTitle}
                    >
                      {entry.mangaTitle}
                    </Link>
                    <span className="text-[10px] text-muted block mt-0.5">
                      Last read {new Date(entry.readAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Link
                      to={`/reader/${entry.chapterId}`}
                      className="inline-flex items-center gap-1.5 bg-accent/10 hover:bg-accent text-accent hover:text-dark text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-300 w-fit cursor-pointer border border-accent/20"
                    >
                      <i className="fa-solid fa-play text-[10px]" />
                      <span>Ch. {entry.chapterNumber ?? '1'}</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Discover Manga Grid */}
      <section className="scroll-reveal flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-800/40 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-accent rounded-full" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Discover Manga</h2>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => {
                setActiveTab('latest')
                setPage(1)
              }}
              className={`px-6 py-2.5 rounded-full text-[12px] font-black tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'latest'
                  ? 'bg-accent text-dark shadow-lg shadow-accent/20'
                  : 'bg-card text-muted hover:text-accent border border-gray-700/50'
              }`}
            >
              LATEST RELEASES
            </button>
            <button
              onClick={() => {
                setActiveTab('popular')
                setPage(1)
              }}
              className={`px-6 py-2.5 rounded-full text-[12px] font-black tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'popular'
                  ? 'bg-accent text-dark shadow-lg shadow-accent/20'
                  : 'bg-card text-muted hover:text-accent border border-gray-700/50'
              }`}
            >
              TOP POPULAR
            </button>
            <button
              onClick={() => {
                setActiveTab('completed')
                setPage(1)
              }}
              className={`px-6 py-2.5 rounded-full text-[12px] font-black tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-accent text-dark shadow-lg shadow-accent/20'
                  : 'bg-card text-muted hover:text-accent border border-gray-700/50'
              }`}
            >
              COMPLETED
            </button>
          </div>
        </div>

        {/* 5x4 Manga Grid with Smooth Tab Switch Loading */}
        {trendingLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={i} 
                className="aspect-[2/3] bg-card/45 rounded-2xl animate-pulse border border-gray-800/30 flex flex-col justify-end p-4 gap-2"
              >
                <div className="h-4 bg-gray-700/50 rounded-md w-3/4" />
                <div className="h-3 bg-gray-800/50 rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {trending.map((manga: Manga, i: number) => (
              <MangaCard key={manga.id} manga={manga} index={i} />
            ))}
          </div>
        )}

        {/* Dynamic bottom pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center mt-6 mb-8 gap-4">
            <div className="flex items-center gap-2 pr-4 border-r border-gray-800/60 mr-2">
              <span className="text-muted text-xs font-bold uppercase tracking-widest">Page</span>
              <span className="text-white font-black text-sm">
                {String(page).padStart(2, '0')}{' '}
                <span className="text-muted/40 mx-1">/</span>{' '}
                {String(totalPages).padStart(2, '0')}
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

              <div className="hidden sm:flex gap-2">
                {(() => {
                  let startPage = 1
                  if (totalPages <= 5) {
                    startPage = 1
                  } else if (page <= 3) {
                    startPage = 1
                  } else if (page >= totalPages - 2) {
                    startPage = totalPages - 4
                  } else {
                    startPage = page - 2
                  }
                  const pagesCount = Math.min(totalPages, 5)
                  return Array.from({ length: pagesCount }).map((_, idx) => {
                    const pNum = startPage + idx
                    return (
                      <button
                        key={pNum}
                        onClick={() => setPage(pNum)}
                        className={`w-12 h-12 rounded-2xl font-black text-sm transition-all cursor-pointer ${
                          page === pNum
                            ? 'bg-accent text-dark shadow-lg shadow-accent/20'
                            : 'bg-card border border-gray-800/40 text-muted hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        {pNum}
                      </button>
                    )
                  })
                })()}
              </div>

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
      </section>
    </div>
  )
}

function HeroSlide({ manga }: { manga: Manga }) {
  const title = manga.attributes.title.en ?? Object.values(manga.attributes.title)[0] ?? 'Untitled'
  const desc = manga.attributes.description.en ?? ''
  const status = manga.attributes.status ?? 'unknown'
  const coverRel = manga.relationships.find((r) => r.type === 'cover_art')
  const coverFile = coverRel?.attributes?.fileName as string | undefined
  const tags = manga.attributes.tags?.slice(0, 4) ?? []

  return (
    <section className="relative hero-slide-bg overflow-hidden h-full">
      <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-6 md:gap-14 p-5 md:p-12 items-center h-full pb-16 md:pb-12">
        {coverFile && (
          <div className="relative h-full flex items-center justify-center max-h-[220px] md:max-h-[460px] flex-shrink-0">
            <img
              src={coverUrl(manga.id, coverFile)}
              alt={title}
              className="max-h-full object-contain rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5"
            />
          </div>
        )}

        <div className="flex flex-col justify-center min-w-0">
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3">
              <span className="bg-accent text-dark px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/20">
                {status.replace('_', ' ')}
              </span>
              <span className="text-accent/80 font-extrabold text-xs">
                <i className="fa-solid fa-fire-flame-curved mr-1.5 animate-pulse" />
                Featured
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black uppercase tracking-tight leading-[0.95] text-white drop-shadow-2xl line-clamp-2">
              {title}
            </h1>

            {desc && (
              <p className="text-muted text-xs sm:text-sm md:text-base leading-relaxed line-clamp-2 sm:line-clamp-3 md:line-clamp-4">{desc}</p>
            )}

            <div className="flex gap-2 flex-wrap">
              {tags.map((tag: Tag) => (
                <span
                  key={tag.id}
                  className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white/5 text-gray-300 border border-white/10"
                >
                  {tag.attributes.name.en}
                </span>
              ))}
            </div>

            <Link
              to={`/manga/${manga.id}`}
              className="inline-flex items-center gap-2 bg-accent hover:bg-pink-500 text-dark font-black px-6 py-3 rounded-xl text-xs sm:text-sm tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-accent/30 self-start shadow-md shadow-accent/15"
            >
              <i className="fa-solid fa-book-open" />
              VIEW DETAILS
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMangaSearch } from '../hooks/useManga'
import { MangaCard } from '../components/ui/MangaCard'
import type { Manga, Tag } from '../lib/types'
import { coverUrl } from '../services/manga'

export function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const { data: latestData, isLoading: latestLoading, isError: latestError } = useMangaSearch({
    limit: 5,
    order: { updatedAt: 'desc' },
    hasAvailableChapters: true,
    contentRating: ['safe', 'suggestive'],
  })

  const { data: trendingData, isLoading: trendingLoading, isError: trendingError } = useMangaSearch({
    limit: 25,
    order: { followedCount: 'desc' },
    hasAvailableChapters: true,
    contentRating: ['safe', 'suggestive'],
  })

  const featured = latestData?.data ?? []
  const trending = trendingData?.data ?? []

  useEffect(() => {
    if (featured.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(featured.length, 5))
    }, 6000)
    return () => clearInterval(interval)
  }, [featured.length])

  if (latestLoading || trendingLoading) {
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

  const hero = featured[currentSlide]

  return (
    <div className="flex flex-col gap-10">
      {/* Hero Carousel */}
      {hero && <HeroSlide manga={hero} />}

      {/* Trending Grid */}
      <section className="scroll-reveal">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-8 bg-accent rounded-full" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Trending</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {trending.map((manga: Manga, i: number) => (
            <MangaCard key={manga.id} manga={manga} index={i} />
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="text-center py-8 border-t border-gray-800/40">
        <p className="text-muted text-xs">
          Data powered by{' '}
          <a href="https://mangadex.org" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            MangaDex
          </a>
          {' '}&middot; Reader's Haven is not affiliated with MangaDex
        </p>
      </div>
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
    <section className="relative bg-[#1a1a1a]/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-800/40">
      <div className="grid grid-cols-1 md:grid-cols-[400px_1fr] gap-6 md:gap-16 p-6 md:p-12 items-center min-h-[500px]">
        {coverFile && (
          <div className="relative">
            <img
              src={coverUrl(manga.id, coverFile)}
              alt={title}
              className="w-full aspect-portrait object-cover rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            />
          </div>
        )}

        <div className="flex flex-col justify-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="bg-accent text-dark px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest shadow-lg shadow-accent/20">
                {status.replace('_', ' ')}
              </span>
              <span className="text-accent/60 font-bold text-xs">
                <i className="fa-solid fa-fire-flame-curved mr-1" />
                Featured
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black uppercase tracking-tight leading-[0.95] text-white drop-shadow-2xl">
              {title}
            </h1>

            {desc && (
              <p className="text-muted text-base leading-relaxed line-clamp-4">{desc}</p>
            )}

            <div className="flex gap-3 flex-wrap">
              {tags.map((tag: Tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-gray-300 border border-white/10"
                >
                  {tag.attributes.name.en}
                </span>
              ))}
            </div>

            <Link
              to={`/manga/${manga.id}`}
              className="inline-flex items-center gap-2 bg-accent hover:bg-pink-500 text-dark font-bold px-6 py-3 rounded-xl text-sm tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-accent/30"
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

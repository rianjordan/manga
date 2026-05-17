import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useManga, useMangaFeed, useMangaSearch } from '../hooks/useManga'
import { coverUrl, mangaService } from '../services/manga'
import { useFollows, useReadingHistory } from '../store/user-data'
import { useAuth } from '../store'
import { useToast } from '../store/toast'
import { api } from '../lib/api'
import { MangaCard } from '../components/ui/MangaCard'
import type { Chapter, Tag, Manga, MangaStatistics } from '../lib/types'

const readingStatuses = [
  { id: 'reading', label: 'Reading', color: 'bg-emerald-500 text-emerald-400' },
  { id: 'on_hold', label: 'On Hold', color: 'bg-amber-500 text-amber-400' },
  { id: 'dropped', label: 'Dropped', color: 'bg-rose-500 text-rose-400' },
  { id: 'plan_to_read', label: 'Plan to Read', color: 'bg-sky-500 text-sky-400' },
  { id: 'completed', label: 'Completed', color: 'bg-indigo-500 text-indigo-400' },
  { id: 're_reading', label: 'Re-Reading', color: 'bg-purple-500 text-purple-400' },
]

export function MangaDetailPage() {
  const { id } = useParams<{ id: string }>()
  
  // ⚠️ ALL HOOKS MUST BE CALLED AT THE TOP IN THE SAME ORDER EVERY RENDER
  const { data: mangaRes, isLoading, isError: isMangaError, error: mangaError } = useManga(id!)
  const { data: feedData, isError: isFeedError } = useMangaFeed(id!, {
    limit: 500,
  })
  
  // Pre-fetch related manga - hooks must be called unconditionally (not after early returns)
  const { data: relatedData } = useMangaSearch({
    limit: 10,
    hasAvailableChapters: true,
    contentRating: ['safe', 'suggestive'],
    order: { followedCount: 'desc' },
  })

  // STATE SETTERS - All hooks must come before early returns
  const [selectedLang, setSelectedLang] = useState<string | null>(null)
  const [chapterQuery, setChapterQuery] = useState('')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  
  // MangaDex statistics from official API
  const [stats, setStats] = useState<MangaStatistics>({
    rating: {
      average: null,
      bayesian: 0,
    },
    follows: 0,
    comments: null,
    rating6MonthsAverage: null,
  })
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)

  // STORE HOOKS
  const { follow, unfollow, getStatus } = useFollows()
  const { addEntry, history } = useReadingHistory()
  const { isLoggedIn, username: currentUsername } = useAuth()
  const { addToast } = useToast()

  // Load MangaDex statistics and comments
  const loadStatsAndComments = async () => {
    if (!id) return
    try {
      // Fetch MangaDex statistics (rating, follows, etc.)
      const statsRes = await mangaService.getStatistics(id)
      if (statsRes) {
        setStats(statsRes)
      }

      // Fetch comments
      const commentsRes = await api.get<any>(`/comments`, { mangaId: id })
      if (commentsRes && commentsRes.data) {
        setComments(commentsRes.data)
      }
    } catch (e) {
      console.error('Failed to load manga statistics or comments:', e)
    }
  }

  useEffect(() => {
    if (!id) return
    
    loadStatsAndComments()
  }, [id])

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !id) return

    try {
      setCommentSubmitting(true)
      await api.post('/comments', {
        mangaId: id,
        content: commentText.trim(),
        chapterId: null
      })
      setCommentText('')
      loadStatsAndComments() // reload comments
    } catch (err: any) {
      addToast('error', err.message || 'Failed to post comment.')
    } finally {
      setCommentSubmitting(false)
    }
  }

  const handleCommentDelete = async (commentId: number) => {
    try {
      await api.delete(`/comments/${commentId}`)
      setComments(comments.filter((c) => c.id !== commentId))
      addToast('success', 'Comment deleted.')
    } catch (err: any) {
      addToast('error', err.message || 'Failed to delete comment.')
    }
  }

  // Relative Time helper
  const formatTimeAgo = (dateStr: string) => {
    const elapsed = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(elapsed / 60000)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)

    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (isLoading || !mangaRes) {
    return (
      <div className="flex flex-col gap-8 page-enter">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          <div className="skeleton aspect-[2/3] w-full" />
          <div className="flex flex-col gap-4">
            <div className="skeleton h-10 w-3/4" />
            <div className="skeleton h-6 w-48" />
            <div className="skeleton h-20 w-full" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-7 w-20" />)}
            </div>
            <div className="flex gap-3 mt-2">
              <div className="skeleton h-12 w-40" />
              <div className="skeleton h-12 w-36" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-14 w-full" />)}
        </div>
      </div>
    )
  }

  // Error state: Failed to load manga details
  if (isMangaError) {
    const errorMessage = mangaError instanceof Error ? mangaError.message : 'Failed to load manga details'
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center">
          <i className="fa-solid fa-triangle-exclamation text-3xl text-rose-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white mb-2">Oops! Something went wrong</h2>
          <p className="text-muted mb-1">We couldn't load the manga details.</p>
          <p className="text-muted text-sm mb-6">{errorMessage}</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-accent hover:bg-pink-500 text-dark font-bold px-6 py-3 rounded-xl text-sm transition-all"
          >
            <i className="fa-solid fa-rotate-left" />
            Try Again
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-card hover:bg-gray-800 text-muted font-bold px-6 py-3 rounded-xl text-sm transition-all border border-gray-700"
          >
            <i className="fa-solid fa-house" />
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const manga = mangaRes.data
  const title = manga.attributes.title.en ?? Object.values(manga.attributes.title)[0] ?? 'Untitled'
  const altTitles = manga.attributes.altTitles?.map((t) => Object.values(t)[0]).filter(Boolean).slice(0, 3) ?? []
  const desc = manga.attributes.description.en ?? 'No description available.'
  const status = manga.attributes.status ?? 'unknown'
  const coverRel = manga.relationships.find((r: { type: string }) => r.type === 'cover_art')
  const coverFile = coverRel?.attributes?.fileName as string | undefined
  const tags = manga.attributes.tags ?? []
  const authorRel = manga.relationships.find((r: { type: string }) => r.type === 'author')
  const artistRel = manga.relationships.find((r: { type: string }) => r.type === 'artist')
  const authorName = (authorRel?.attributes as any)?.name ?? null
  const artistName = (artistRel?.attributes as any)?.name ?? null

  // Filter related manga by tags from the loaded manga
  const topTagIds = tags.slice(0, 3).map((t: Tag) => t.id)
  const relatedManga = (relatedData?.data ?? [])
    .filter((m: Manga) => m.id !== id && (topTagIds.length === 0 || m.attributes.tags?.some(tag => topTagIds.includes(tag.id))))
    .slice(0, 6)
  
  const allChapters = feedData?.data ?? []
  const availableLanguages = Array.from(
    new Set(
      allChapters
        .map((ch) => ch.attributes.translatedLanguage)
        .filter(Boolean)
    )
  ).sort() as string[]

  let activeLang = selectedLang
  if (!activeLang && availableLanguages.length > 0) {
    if (availableLanguages.includes('en')) {
      activeLang = 'en'
    } else if (availableLanguages.includes('id')) {
      activeLang = 'id'
    } else if (availableLanguages.includes('ja')) {
      activeLang = 'ja'
    } else {
      activeLang = availableLanguages[0]
    }
  }

  // Filter and sort chapters in descending order by chapter number (latest first)
  const chapters = allChapters
    .filter((ch) => ch.attributes.translatedLanguage === (activeLang ?? 'en'))
    .sort((a, b) => {
      const numA = parseFloat(a.attributes.chapter ?? '0') || 0
      const numB = parseFloat(b.attributes.chapter ?? '0') || 0
      return numB - numA
    })

  // Find the absolute earliest chapter (lowest chapter number, e.g. Chapter 1) to start reading
  const earliestChapter = chapters.length > 0
    ? [...chapters].sort((a, b) => {
        const numA = parseFloat(a.attributes.chapter ?? '0') || 0
        const numB = parseFloat(b.attributes.chapter ?? '0') || 0
        return numA - numB
      })[0]
    : null

  const followStatus = getStatus(id!)

  // Real-time chapter filtering by number or name
  const filteredChapters = chapters.filter((ch) => {
    if (!chapterQuery.trim()) return true
    const q = chapterQuery.toLowerCase()
    return (
      (ch.attributes.chapter && ch.attributes.chapter.toLowerCase().includes(q)) ||
      (ch.attributes.title && ch.attributes.title.toLowerCase().includes(q))
    )
  })

  const grouped = filteredChapters.reduce(
    (acc: Record<string, Chapter[]>, ch: Chapter) => {
      const vol = ch.attributes.volume ?? '0'
      if (!acc[vol]) acc[vol] = []
      acc[vol].push(ch)
      return acc;
    },
    {} as Record<string, Chapter[]>,
  )

  const sortedVolumes = Object.entries(grouped).sort(([a], [b]) => {
    if (a === '0') return -1
    if (b === '0') return 1
    const numA = parseFloat(a) || 0
    const numB = parseFloat(b) || 0
    return numB - numA
  })

  const handleStartReading = () => {
    if (earliestChapter) {
      addEntry({
        mangaId: id!,
        mangaTitle: title,
        coverFile: coverFile ?? '',
        chapterId: earliestChapter.id,
        chapterNumber: earliestChapter.attributes.chapter,
        page: 1,
        readAt: new Date().toISOString(),
      })
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        {coverFile && (
          <div className="relative max-w-[240px] md:max-w-none mx-auto w-full">
            <img
              src={coverUrl(manga.id, coverFile)}
              alt={title}
              className="w-full aspect-[2/3] object-cover rounded-xl shadow-2xl border border-white/5"
            />
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-3">
              {title}
            </h1>
            {altTitles.length > 0 && (
              <p className="text-xs text-muted/70 mb-2 italic truncate">
                {altTitles.join(' · ')}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-accent/15 text-accent px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest">
                {status.replace('_', ' ')}
              </span>
              {manga.attributes.year && (
                <span className="text-muted text-sm">{manga.attributes.year}</span>
              )}
              {authorName && (
                <span className="text-muted text-sm flex items-center gap-1">
                  <i className="fa-solid fa-pen-nib text-[10px]" />
                  <span className="text-white/80 font-semibold">{authorName}</span>
                </span>
              )}
              {artistName && artistName !== authorName && (
                <span className="text-muted text-sm flex items-center gap-1">
                  <i className="fa-solid fa-palette text-[10px]" />
                  <span className="text-white/80 font-semibold">{artistName}</span>
                </span>
              )}
            </div>

            {/* Stats Row: MangaDex Official Ratings & Follows */}
            <div className="flex flex-wrap items-center gap-4 bg-card/40 border border-white/5 p-3 rounded-xl mb-2 text-xs font-bold text-muted uppercase">
              <span className="flex items-center gap-1.5 text-white/80">
                <i className="fa-solid fa-bookmark text-accent text-sm" />
                <span>{stats.follows.toLocaleString()} Follows</span>
              </span>
              <span className="h-3 w-px bg-gray-800" />
              <span className="flex items-center gap-1.5 text-white/80">
                <i className="fa-solid fa-star text-amber-400 text-sm" />
                <span title="Official MangaDex Bayesian Rating">
                  {stats.rating.bayesian ? `${(stats.rating.bayesian).toFixed(2)} / 10` : 'No rating'} (Bayesian)
                </span>
              </span>
              
              {stats.rating.average && (
                <>
                  <span className="h-3 w-px bg-gray-800" />
                  <span className="flex items-center gap-1.5 text-white/80">
                    <i className="fa-solid fa-chart-line text-sky-400 text-sm" />
                    <span title="Official MangaDex Mean Rating">
                      {stats.rating.average.toFixed(2)} / 10 (Mean)
                    </span>
                  </span>
                </>
              )}
              
              {stats.rating6MonthsAverage && (
                <>
                  <span className="h-3 w-px bg-gray-800" />
                  <span className="flex items-center gap-1.5 text-white/80 text-[10px]">
                    <i className="fa-solid fa-calendar text-purple-400 text-xs" />
                    <span title="Last 6 months average">
                      {stats.rating6MonthsAverage.toFixed(2)} (6mo)
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>

          {desc && (
            <p className="text-muted text-sm leading-relaxed line-clamp-6">{desc}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {tags.map((tag: Tag) => (
              <span
                key={tag.id}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-gray-300 border border-white/10"
              >
                {tag.attributes.name.en}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link
              to={
                earliestChapter
                  ? `/reader/${earliestChapter.id}`
                  : '#'
              }
              onClick={handleStartReading}
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-pink-500 text-dark font-bold px-6 py-3 rounded-xl text-sm tracking-wide transition-all hover:shadow-lg hover:shadow-accent/30 w-full sm:w-auto text-center"
            >
              <i className="fa-solid fa-book-open" />
              {earliestChapter ? 'START READING' : 'NO CHAPTERS'}
            </Link>

            <div className="relative w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold tracking-wide transition-all cursor-pointer w-full sm:w-auto ${
                  followStatus
                    ? 'bg-accent/15 text-accent border border-accent/30'
                    : 'bg-card text-muted border border-gray-700/50 hover:text-accent'
                }`}
              >
                <i className="fa-solid fa-bookmark" />
                <span>
                  {followStatus
                    ? readingStatuses.find((s) => s.id === followStatus)?.label ?? 'BOOKMARKED'
                    : 'ADD TO LIST'}
                </span>
                <i className="fa-solid fa-chevron-down text-xs ml-1" />
              </button>

              {showStatusDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowStatusDropdown(false)} 
                  />
                  <div className="absolute left-0 mt-2 w-56 rounded-xl bg-card border border-gray-800 shadow-2xl py-2 z-50 animate-fade-in">
                    <div className="px-3 py-1.5 text-xs font-bold text-muted uppercase tracking-wider border-b border-gray-800/65 mb-1">
                      Set Status
                    </div>
                    {readingStatuses.map((statusItem) => (
                      <button
                        key={statusItem.id}
                        type="button"
                        onClick={() => {
                          follow(id!, statusItem.id)
                          setShowStatusDropdown(false)
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-white/5 cursor-pointer text-left ${
                          followStatus === statusItem.id ? 'text-accent font-black' : 'text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${statusItem.color.split(' ')[0]}`} />
                          <span>{statusItem.label}</span>
                        </div>
                        {followStatus === statusItem.id && (
                          <i className="fa-solid fa-check text-accent text-xs" />
                        )}
                      </button>
                    ))}
                    {followStatus && (
                      <>
                        <div className="h-px bg-gray-800 my-1.5" />
                        <button
                          type="button"
                          onClick={() => {
                            unfollow(id!)
                            setShowStatusDropdown(false)
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer text-left font-bold"
                        >
                          <i className="fa-solid fa-trash-can text-xs" />
                          <span>Remove from List</span>
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-accent rounded-full" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              Chapters
            </h2>
            <span className="text-muted text-sm">({chapters.length})</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Real-time search bar */}
            <div className="relative min-w-[200px] flex-grow sm:flex-grow-0">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-xs" />
              <input
                type="text"
                placeholder="Search chapter..."
                value={chapterQuery}
                onChange={(e) => setChapterQuery(e.target.value)}
                className="w-full bg-card hover:bg-gray-800/80 border border-gray-700/50 rounded-xl py-1.5 pl-9 pr-8 text-xs text-white placeholder-gray-500 outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent/30"
              />
              {chapterQuery && (
                <button
                  type="button"
                  onClick={() => setChapterQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-accent text-xs cursor-pointer"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>

            {/* Language flags */}
            <div className="flex gap-1.5 flex-wrap">
              {availableLanguages.map((l) => {
                const mapping: Record<string, string> = {
                  en: 'us',
                  id: 'id',
                  ja: 'jp',
                  ko: 'kr',
                  es: 'es',
                  fr: 'fr',
                  zh: 'cn',
                  pt: 'pt',
                  ru: 'ru',
                  it: 'it',
                  de: 'de',
                  vi: 'vn',
                  pl: 'pl',
                  tr: 'tr',
                }
                const country = mapping[l.toLowerCase()] ?? l.toLowerCase()

                return (
                  <button
                    key={l}
                    onClick={() => setSelectedLang(l)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeLang === l
                        ? 'bg-accent text-dark shadow-md shadow-accent/25'
                        : 'bg-card text-muted hover:text-accent border border-gray-700/50'
                    }`}
                  >
                    <img
                      src={`https://flagcdn.com/16x12/${country}.png`}
                      alt={l}
                      className="w-4 h-3 object-contain rounded-sm flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                    <span>{l.toUpperCase()}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {isFeedError && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
            <i className="fa-solid fa-circle-exclamation text-amber-400 text-lg flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-amber-400 font-semibold text-sm">Unable to load chapters</p>
              <p className="text-amber-300/70 text-xs mt-0.5">Some chapters may be unavailable. Try refreshing the page.</p>
            </div>
          </div>
        )}

        {sortedVolumes.map(([vol, volChapters]) => (
          <div key={vol} className="mb-4">
            {vol !== '0' && (
              <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-2 px-2">
                Volume {vol}
              </h3>
            )}
            <div className="bg-card/50 rounded-xl border border-gray-800/40 divide-y divide-gray-800/40">
              {(volChapters as Chapter[]).map((ch: Chapter) => {
                const isRead = history.some((h) => h.chapterId === ch.id)
                return (
                  <Link
                    key={ch.id}
                    to={`/reader/${ch.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-card transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-white">
                        Ch. {ch.attributes.chapter}
                      </span>
                      {ch.attributes.title && (
                        <span className="text-sm text-muted hidden sm:block">
                          &mdash; {ch.attributes.title}
                        </span>
                      )}
                      {isRead && (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
                          <i className="fa-solid fa-check text-[8px]" /> READ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span>{ch.attributes.pages} pages</span>
                      <i className="fa-solid fa-chevron-right text-accent opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      {/* Related Manga — You May Also Like */}
      {relatedManga.length > 0 && (
        <section className="border-t border-gray-800/60 pt-8 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-sky-500 rounded-full" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              You May Also Like
            </h2>
          </div>
          <div className="scroll-section">
            {relatedManga.map((m: Manga, i: number) => (
              <div key={m.id} className="w-[160px] sm:w-[180px]">
                <MangaCard manga={m} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* MANGA LEVEL COMMENTS FEED                          */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="border-t border-gray-800/60 pt-8 mt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-8 bg-accent rounded-full" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            Discussion Feed
          </h2>
          <span className="text-muted text-sm">({comments.length})</span>
        </div>

        {/* Comment Composer */}
        {isLoggedIn ? (
          <form onSubmit={handleCommentSubmit} className="flex gap-4 items-start bg-card/30 border border-white/5 p-5 rounded-2xl mb-6">
            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${currentUsername}`}
              className="w-10 h-10 rounded-xl bg-gray-800 border border-white/5 flex-shrink-0"
              alt={currentUsername ?? 'User'}
            />
            <div className="flex-grow flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment about this manga..."
                className="flex-grow bg-[#2A2A2A] border border-gray-700/50 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-500 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-semibold"
                required
              />
              <button
                type="submit"
                disabled={commentSubmitting || !commentText.trim()}
                className="bg-accent hover:bg-accent-hover text-black text-xs font-black uppercase tracking-wider py-3.5 px-6 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer flex-shrink-0"
              >
                <i className="fa-solid fa-paper-plane" />
                <span>Comment</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-black/10 border border-dashed border-white/5 rounded-2xl p-6 text-center text-xs font-bold text-muted uppercase tracking-wider mb-6">
            Please <Link to="/login" className="text-accent underline font-black">log in</Link> to share your comments.
          </div>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="bg-card/45 border border-white/5 rounded-2xl p-10 text-center text-xs font-bold text-muted uppercase tracking-wider">
            No comments yet. Start the conversation!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-card/30 border border-gray-800/40 p-4 rounded-xl flex gap-4 items-start hover:bg-card/50 transition-colors"
              >
                <img
                  src={comment.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.username}`}
                  className="w-10 h-10 rounded-xl bg-gray-800 border border-white/5 flex-shrink-0"
                  alt={comment.username}
                />
                <div className="min-w-0 flex-1 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white">{comment.username}</span>
                      <span className="text-[10px] text-muted font-bold">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    {isLoggedIn && currentUsername === comment.username && (
                      <button
                        onClick={() => handleCommentDelete(comment.id)}
                        className="text-red-400 hover:text-red-500 transition-colors p-1 cursor-pointer bg-transparent border-none"
                        title="Delete comment"
                      >
                        <i className="fa-solid fa-trash text-xs" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed font-semibold whitespace-pre-line">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

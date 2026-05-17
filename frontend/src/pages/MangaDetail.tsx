import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useManga, useMangaFeed } from '../hooks/useManga'
import { coverUrl } from '../services/manga'
import { useFollows, useReadingHistory } from '../store/user-data'
import type { Chapter, Tag } from '../lib/types'

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
  const { data: mangaRes, isLoading } = useManga(id!)
  const [selectedLang, setSelectedLang] = useState<string | null>(null)
  const [chapterQuery, setChapterQuery] = useState('')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)

  const { data: feedData } = useMangaFeed(id!, {
    limit: 500,
  })

  const { follow, unfollow, getStatus } = useFollows()
  const { addEntry, history } = useReadingHistory()

  if (isLoading || !mangaRes) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const manga = mangaRes.data
  const title = manga.attributes.title.en ?? Object.values(manga.attributes.title)[0] ?? 'Untitled'
  const desc = manga.attributes.description.en ?? 'No description available.'
  const status = manga.attributes.status ?? 'unknown'
  const coverRel = manga.relationships.find((r: { type: string }) => r.type === 'cover_art')
  const coverFile = coverRel?.attributes?.fileName as string | undefined
  const tags = manga.attributes.tags ?? []
  
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
          <div className="relative">
            <img
              src={coverUrl(manga.id, coverFile)}
              alt={title}
              className="w-full aspect-[2/3] object-cover rounded-xl shadow-2xl"
            />
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-3">
              {title}
            </h1>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-accent/15 text-accent px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest">
                {status.replace('_', ' ')}
              </span>
              {manga.attributes.year && (
                <span className="text-muted text-sm">{manga.attributes.year}</span>
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

          <div className="flex gap-3 mt-2">
            <Link
              to={
                earliestChapter
                  ? `/reader/${earliestChapter.id}`
                  : '#'
              }
              onClick={handleStartReading}
              className="inline-flex items-center gap-2 bg-accent hover:bg-pink-500 text-dark font-bold px-6 py-3 rounded-xl text-sm tracking-wide transition-all hover:shadow-lg hover:shadow-accent/30"
            >
              <i className="fa-solid fa-book-open" />
              {earliestChapter ? 'START READING' : 'NO CHAPTERS'}
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold tracking-wide transition-all cursor-pointer ${
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
    </div>
  )
}

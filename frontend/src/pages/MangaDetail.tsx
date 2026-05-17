import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useManga, useMangaFeed } from '../hooks/useManga'
import { coverUrl } from '../services/manga'
import { useFollows, useReadingHistory } from '../store/user-data'
import type { Chapter, Tag } from '../lib/types'

export function MangaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: mangaRes, isLoading } = useManga(id!)
  const [selectedLang, setSelectedLang] = useState<string | null>(null)

  const { data: feedData } = useMangaFeed(id!, {
    limit: 500,
  })

  const { follow, unfollow, getStatus } = useFollows()
  const { addEntry } = useReadingHistory()

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

  const chapters = allChapters.filter((ch) => ch.attributes.translatedLanguage === (activeLang ?? 'en'))
  const followStatus = getStatus(id!)

  const grouped = chapters.reduce(
    (acc: Record<string, Chapter[]>, ch: Chapter) => {
      const vol = ch.attributes.volume ?? '0'
      if (!acc[vol]) acc[vol] = []
      acc[vol].push(ch)
      return acc;
    },
    {} as Record<string, Chapter[]>,
  )

  const sortedVolumes = Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a))

  const handleStartReading = () => {
    if (chapters.length > 0) {
      addEntry({
        mangaId: id!,
        mangaTitle: title,
        coverFile: coverFile ?? '',
        chapterId: chapters[chapters.length - 1].id,
        chapterNumber: chapters[chapters.length - 1].attributes.chapter,
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
                chapters.length > 0
                  ? `/reader/${chapters[chapters.length - 1].id}`
                  : '#'
              }
              onClick={handleStartReading}
              className="inline-flex items-center gap-2 bg-accent hover:bg-pink-500 text-dark font-bold px-6 py-3 rounded-xl text-sm tracking-wide transition-all hover:shadow-lg hover:shadow-accent/30"
            >
              <i className="fa-solid fa-book-open" />
              {chapters.length > 0 ? 'START READING' : 'NO CHAPTERS'}
            </Link>

            <button
              onClick={() =>
                followStatus
                  ? unfollow(id!)
                  : follow(id!, 'reading')
              }
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${
                followStatus
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'bg-card text-muted border border-gray-700/50 hover:text-accent'
              }`}
            >
              <i className="fa-solid fa-bookmark" />
              {followStatus ? 'FOLLOWING' : 'FOLLOW'}
            </button>
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-accent rounded-full" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              Chapters
            </h2>
            <span className="text-muted text-sm">({chapters.length})</span>
          </div>

          <div className="flex gap-2 flex-wrap">
            {availableLanguages.map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLang(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                  activeLang === l
                    ? 'bg-accent text-dark'
                    : 'bg-card text-muted hover:text-accent border border-gray-700/50'
                }`}
              >
                {l === 'en' ? '🇺🇸 EN' : l === 'id' ? '🇮🇩 ID' : l === 'ja' ? '🇯🇵 JA' : l === 'es' ? '🇪🇸 ES' : l.toUpperCase()}
              </button>
            ))}
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
              {(volChapters as Chapter[]).map((ch: Chapter) => (
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
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span>{ch.attributes.pages} pages</span>
                    <i className="fa-solid fa-chevron-right text-accent opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

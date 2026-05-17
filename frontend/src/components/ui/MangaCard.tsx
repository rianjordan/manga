import { Link } from 'react-router-dom'
import type { Manga } from '../../lib/types'
import { coverUrl } from '../../services/manga'
import { useReadingHistory } from '../../store/user-data'
import { useFollows } from '../../store/user-data'

interface MangaCardProps {
  manga: Manga
  index?: number
  rating?: number
}

const statusColors: Record<string, string> = {
  reading: 'bg-emerald-500',
  completed: 'bg-indigo-500',
  plan_to_read: 'bg-sky-500',
  on_hold: 'bg-amber-500',
  dropped: 'bg-rose-500',
  re_reading: 'bg-purple-500',
}

export function MangaCard({ manga, index = 0, rating }: MangaCardProps) {
  const title = manga.attributes.title.en ?? Object.values(manga.attributes.title)[0] ?? 'Untitled'
  const coverRel = manga.relationships.find((r) => r.type === 'cover_art')
  const coverFile = coverRel?.attributes?.fileName as string | undefined
  const latestChapter = manga.attributes.latestChapter
  const { getStatus } = useFollows()
  const { history } = useReadingHistory()
  const followStatus = getStatus(manga.id)
  const isRead = history.some((h) => h.mangaId === manga.id)

  const contentRating = manga.attributes.contentRating
  const ratingBadge = contentRating === 'suggestive' ? 'Suggestive' : null

  return (
    <Link
      to={`/manga/${manga.id}`}
      className="group bg-card rounded-xl overflow-hidden cursor-pointer flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-accent/10 card-reveal"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-darker">
        {coverFile ? (
          <img
            src={coverUrl(manga.id, coverFile)}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted/30">
            <i className="fa-solid fa-book text-4xl" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/50">
            <i className="fa-solid fa-play text-white text-sm ml-0.5" />
          </div>
        </div>

        {/* Content rating badge */}
        {ratingBadge && (
          <span className="absolute top-2 left-2 bg-amber-500/90 text-black text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md tracking-wider">
            {ratingBadge}
          </span>
        )}

        {/* Follow status dot */}
        {followStatus && (
          <span className={`absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-black/50 ${statusColors[followStatus] ?? 'bg-gray-500'}`}
            title={followStatus.replace('_', ' ')}
          />
        )}
      </div>

      {/* Reading progress bar */}
      {isRead && (
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: '100%' }} />
        </div>
      )}

      <div className="p-3 sm:p-4 flex flex-col gap-1.5 flex-grow justify-between">
        <div>
          <h4 className="font-bold text-white text-sm truncate group-hover:text-accent transition-colors">
            {title}
          </h4>
          {latestChapter && (
            <span className="text-xs text-muted font-semibold">
              Ch. {latestChapter}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-muted text-xs">
          <span className="capitalize">{manga.attributes.status?.replace('_', ' ')}</span>
          {rating !== undefined && rating !== null ? (
            <span className="flex items-center gap-1 text-amber-400 font-extrabold text-xs bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10">
              <i className="fa-solid fa-star text-[10px]" /> {rating.toFixed(1)}
            </span>
          ) : followStatus ? (
            <span className="capitalize text-accent/70 font-bold text-[10px]">
              {followStatus.replace('_', ' ')}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

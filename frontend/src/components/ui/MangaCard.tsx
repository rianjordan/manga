import { Link } from 'react-router-dom'
import type { Manga } from '../../lib/types'
import { coverUrl } from '../../services/manga'

interface MangaCardProps {
  manga: Manga
  index?: number
}

export function MangaCard({ manga, index = 0 }: MangaCardProps) {
  const title = manga.attributes.title.en ?? Object.values(manga.attributes.title)[0] ?? 'Untitled'
  const coverRel = manga.relationships.find((r) => r.type === 'cover_art')
  const coverFile = coverRel?.attributes?.fileName as string | undefined
  const latestChapter = manga.attributes.latestChapter

  return (
    <Link
      to={`/manga/${manga.id}`}
      className="group bg-card rounded-lg overflow-hidden cursor-pointer flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10"
      style={{ animationDelay: `${index * 80}ms` }}
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
      </div>
      <div className="p-3 sm:p-4 flex flex-col gap-2 flex-grow justify-between">
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
        <div className="flex items-center gap-2 text-muted text-xs">
          <span className="capitalize">{manga.attributes.status?.replace('_', ' ')}</span>
        </div>
      </div>
    </Link>
  )
}

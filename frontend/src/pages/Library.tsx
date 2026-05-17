import { useFollows } from '../store/user-data'
import { useMangaSearch } from '../hooks/useManga'
import { MangaCard } from '../components/ui/MangaCard'
import { Link } from 'react-router-dom'
import type { Manga } from '../lib/types'

export function LibraryPage() {
  const { follows } = useFollows()
  const mangaIds = Object.keys(follows)

  const { data, isLoading } = useMangaSearch({
    ids: mangaIds.length > 0 ? mangaIds : ['00000000-0000-0000-0000-000000000000'],
    limit: 100,
  })

  const hasFollows = mangaIds.length > 0
  const libraryList = hasFollows ? data?.data ?? [] : []

  return (
    <div className="flex flex-col gap-8 min-h-[60vh]">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gray-800/40 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-accent rounded-full animate-pulse" />
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            My Library
          </h1>
          <span className="text-muted text-sm font-semibold bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            {mangaIds.length} Saved
          </span>
        </div>
      </div>

      {/* Grid Content */}
      {isLoading && hasFollows ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !hasFollows || libraryList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-accent/10 border border-accent/20 text-accent rounded-full flex items-center justify-center mb-6 text-2xl shadow-lg shadow-accent/5">
            <i className="fa-regular fa-bookmark" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Your Library is Empty</h3>
          <p className="text-muted text-sm leading-relaxed mb-6">
            You haven't followed any manga yet. Bookmark manga you love to receive notification updates and save them here!
          </p>
          <Link
            to="/search"
            className="bg-accent hover:bg-pink-500 text-dark font-black px-6 py-3 rounded-xl text-sm tracking-wide transition-all shadow-lg shadow-accent/20"
          >
            DISCOVER MANGA
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {libraryList.map((manga: Manga, i: number) => (
            <MangaCard key={manga.id} manga={manga} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

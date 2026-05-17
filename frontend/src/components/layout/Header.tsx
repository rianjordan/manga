import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, useSettings } from '../../store'
import { useReadingHistory } from '../../store/user-data'
import { coverUrl } from '../../services/manga'

export function Header() {
  const { isLoggedIn, username, logout } = useAuth()
  const { theme, toggleTheme } = useSettings()
  const { getRecent } = useReadingHistory()

  const [isBrowseOpen, setIsBrowseOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isGenresOpen, setIsGenresOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const browseRef = useRef<HTMLDivElement>(null)
  const historyRef = useRef<HTMLDivElement>(null)
  const genresRef = useRef<HTMLDivElement>(null)

  // Click outside listener
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (browseRef.current && !browseRef.current.contains(e.target as Node)) {
        setIsBrowseOpen(false)
      }
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setIsHistoryOpen(false)
      }
      if (genresRef.current && !genresRef.current.contains(e.target as Node)) {
        setIsGenresOpen(false)
      }
    }
    document.addEventListener('mousedown', clickOutside)
    return () => document.removeEventListener('mousedown', clickOutside)
  }, [])

  const recentHistory = getRecent(5)
  const logoSrc = '/favicon.svg'

  return (
    <header className="sticky top-0 z-40 bg-darker/95 backdrop-blur-md border-b border-gray-800/60 shadow-lg py-3 px-4 md:px-8 flex justify-between items-center transition-all duration-300">
      
      {/* Left Logo */}
      <Link to="/" className="flex items-center gap-3 cursor-pointer group">
        {logoSrc && <img src={logoSrc} alt="" className="w-8 h-8 rounded-lg" />}
        <span className="font-black text-2xl tracking-wider hidden sm:block text-accent">
          Reader's Haven
        </span>
      </Link>

      {/* Center Navigation Dropdowns */}
      <nav className="hidden lg:flex items-center gap-3 relative">
        {/* Browse Catalog */}
        <div ref={browseRef} className="relative">
          <button
            onClick={() => setIsBrowseOpen(!isBrowseOpen)}
            className="flex items-center gap-2 bg-card hover:bg-gray-800 text-muted hover:text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-md cursor-pointer"
          >
            BROWSE CATALOG
            <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-300 ${isBrowseOpen ? 'rotate-180 text-accent' : ''}`} />
          </button>
          {isBrowseOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-gray-700/50 rounded-2xl shadow-2xl z-50 py-2 transition-all">
              <Link
                to="/search?type=manhwa"
                className="block px-5 py-2.5 text-sm text-muted hover:text-accent hover:bg-accent/5 transition-all"
                onClick={() => setIsBrowseOpen(false)}
              >
                Manhwa
              </Link>
              <Link
                to="/search?type=manga"
                className="block px-5 py-2.5 text-sm text-muted hover:text-accent hover:bg-accent/5 transition-all"
                onClick={() => setIsBrowseOpen(false)}
              >
                Manga
              </Link>
              <Link
                to="/search?type=novel"
                className="block px-5 py-2.5 text-sm text-muted hover:text-accent hover:bg-accent/5 transition-all"
                onClick={() => setIsBrowseOpen(false)}
              >
                Novel
              </Link>
            </div>
          )}
        </div>

        {/* My History */}
        <div ref={historyRef} className="relative">
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="flex items-center gap-2 bg-card hover:bg-gray-800 text-muted hover:text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-md cursor-pointer"
          >
            MY HISTORY
            <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-300 ${isHistoryOpen ? 'rotate-180 text-accent' : ''}`} />
          </button>
          {isHistoryOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-card border border-gray-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-700/50 font-bold text-accent text-xs tracking-wider uppercase">
                Recently Read
              </div>
              {recentHistory.length === 0 ? (
                <div className="p-6 text-center text-muted text-xs">
                  No recently read manga.
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-800/40">
                  {recentHistory.map((entry) => (
                    <Link
                      key={entry.chapterId}
                      to={`/reader/${entry.chapterId}`}
                      className="p-3 flex items-center gap-3 hover:bg-gray-800/60 transition-colors"
                      onClick={() => setIsHistoryOpen(false)}
                    >
                      <img
                        src={entry.coverFile ? coverUrl(entry.mangaId, entry.coverFile) : 'https://placehold.co/40x60'}
                        className="w-10 h-14 object-cover rounded-lg"
                        alt={entry.mangaTitle}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm text-white line-clamp-1">
                          {entry.mangaTitle}
                        </div>
                        <div className="text-xs text-muted">
                          {entry.chapterNumber ? `Ch. ${entry.chapterNumber}` : 'Ch. Unknown'}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Genre Filters */}
        <div ref={genresRef} className="relative">
          <button
            onClick={() => setIsGenresOpen(!isGenresOpen)}
            className="flex items-center gap-2 bg-card hover:bg-gray-800 text-muted hover:text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-md cursor-pointer"
          >
            GENRES
            <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-300 ${isGenresOpen ? 'rotate-180 text-accent' : ''}`} />
          </button>
          {isGenresOpen && (
            <div className="absolute top-full left-0 mt-2 w-52 bg-card border border-gray-700/50 rounded-2xl shadow-2xl z-50 py-2 max-h-80 overflow-y-auto">
              {['Action', 'Romance', 'Fantasy', 'Horror', 'Sci-Fi', 'Comedy', 'Drama', 'Slice of Life'].map((genre) => (
                <Link
                  key={genre}
                  to={`/search?q=${genre}`}
                  className="block px-5 py-2.5 text-sm text-muted hover:text-accent hover:bg-accent/5 transition-all"
                  onClick={() => setIsGenresOpen(false)}
                >
                  {genre}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link
          to="/search?order=latest"
          className="flex items-center gap-2 bg-card hover:bg-gray-800 text-muted hover:text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-md"
        >
          NEW RELEASES
        </Link>
      </nav>

      {/* Right side Actions */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-card rounded-full px-4 py-2 gap-2 border border-transparent focus-within:border-accent transition-all duration-300">
          <i className="fa-solid fa-magnifying-glass text-muted text-sm" />
          <input
            type="text"
            placeholder="Search manga..."
            className="bg-transparent border-none outline-none text-sm w-36 lg:w-48 text-white placeholder-muted"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                const searchParams = new URLSearchParams()
                searchParams.set('q', (e.target as HTMLInputElement).value.trim())
                window.location.href = `/search?${searchParams.toString()}`
              }
            }}
          />
        </div>

        {/* Dynamic Avatar Link to Library */}
        <Link
          to="/library"
          className="w-9 h-9 rounded-full bg-card flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-accent transition-all duration-300 text-muted hover:text-white"
          title="My Library"
        >
          <i className="fa-solid fa-bookmark text-sm" />
        </Link>

        {isLoggedIn ? (
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-sm text-muted">{username}</span>
            <button
              onClick={logout}
              className="text-xs font-black text-red-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              LOG OUT
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2.5 border-l border-gray-800/60 pl-4 ml-1">
            <Link
              to="/login"
              className="text-xs font-black text-muted hover:text-accent transition-colors tracking-tighter"
            >
              LOG IN
            </Link>
            <div className="h-3 w-px bg-gray-800/80" />
            <Link
              to="/signup"
              className="text-xs font-black text-muted hover:text-accent transition-colors tracking-tighter"
            >
              SIGN UP
            </Link>
          </div>
        )}

        <button onClick={toggleTheme} className="text-muted hover:text-accent transition-colors p-1 cursor-pointer">
          <i className={`fa-solid ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`} />
        </button>

        {/* Hamburger Trigger */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="text-xl text-muted hover:text-accent transition-colors ml-1 cursor-pointer"
          aria-label="Open menu"
        >
          <i className="fa-solid fa-bars" />
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* SIDEBAR DRAWER PANEL                                */}
      {/* ═══════════════════════════════════════════════════ */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-50 transition-all duration-300 backdrop-blur-sm"
        />
      )}
      <aside
        className={`fixed top-0 right-0 w-[300px] h-full bg-card shadow-[-10px_0_40px_rgba(0,0,0,0.6)] z-[60] flex flex-col transition-all duration-500 ease-out transform ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none invisible'
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-800/50">
          <span className="font-bold text-xl tracking-wide text-white">Reader's Haven</span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-2xl text-muted hover:text-accent transition-colors duration-300 cursor-pointer"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-1 flex-grow overflow-y-auto">
          <Link
            to="/"
            className="flex items-center gap-4 text-white font-semibold p-3.5 rounded-xl hover:bg-accent/10 hover:text-accent transition-all duration-300 transform hover:translate-x-2"
            onClick={() => setIsSidebarOpen(false)}
          >
            <i className="fa-solid fa-house w-5 text-center text-muted" /> Home
          </Link>
          <Link
            to="/search"
            className="flex items-center gap-4 text-white font-semibold p-3.5 rounded-xl hover:bg-accent/10 hover:text-accent transition-all duration-300 transform hover:translate-x-2"
            onClick={() => setIsSidebarOpen(false)}
          >
            <i className="fa-solid fa-compass w-5 text-center text-muted" /> Explore
          </Link>
          <Link
            to="/library"
            className="flex items-center gap-4 text-white font-semibold p-3.5 rounded-xl hover:bg-accent/10 hover:text-accent transition-all duration-300 transform hover:translate-x-2"
            onClick={() => setIsSidebarOpen(false)}
          >
            <i className="fa-solid fa-bookmark w-5 text-center text-muted" /> My Library
          </Link>
          <button
            onClick={() => {
              toggleTheme()
              setIsSidebarOpen(false)
            }}
            className="flex items-center gap-4 text-white font-semibold p-3.5 rounded-xl hover:bg-accent/10 hover:text-accent transition-all text-left duration-300 transform hover:translate-x-2 cursor-pointer"
          >
            <i className={`fa-solid ${theme === 'dark' ? 'fa-moon' : 'fa-sun'} w-5 text-center text-muted`} />
            Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
          <div className="h-px bg-gray-800/50 my-3" />
          {isLoggedIn ? (
            <button
              onClick={() => {
                logout()
                setIsSidebarOpen(false)
              }}
              className="flex items-center gap-4 text-red-400 font-semibold p-3.5 rounded-xl hover:bg-red-500/10 transition-all text-left duration-300 transform hover:translate-x-2 cursor-pointer"
            >
              <i className="fa-solid fa-right-from-bracket w-5 text-center" /> Log Out ({username})
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-4 text-accent font-semibold p-3.5 rounded-xl hover:bg-accent/10 hover:text-accent transition-all duration-300 transform hover:translate-x-2"
              onClick={() => setIsSidebarOpen(false)}
            >
              <i className="fa-solid fa-right-from-bracket w-5 text-center" /> Login / Sign Up
            </Link>
          )}
        </div>
      </aside>
    </header>
  )
}

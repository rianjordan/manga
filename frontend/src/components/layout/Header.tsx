import { Link } from 'react-router-dom'
import { useAuth, useSettings } from '../../store'

export function Header() {
  const { isLoggedIn, username, logout } = useAuth()
  const { theme, toggleTheme } = useSettings()

  const logoSrc = '/favicon.svg'

  return (
    <header className="sticky top-0 z-40 bg-darker/95 backdrop-blur-md border-b border-gray-800/60 shadow-lg py-3 px-4 md:px-8 flex justify-between items-center transition-all duration-300">
      <Link to="/" className="flex items-center gap-3 cursor-pointer group">
        {logoSrc && <img src={logoSrc} alt="" className="w-8 h-8 rounded-lg" />}
        <span className="font-black text-2xl tracking-wider hidden sm:block text-accent">
          Reader's Haven
        </span>
      </Link>

      <div className="flex items-center gap-3 sm:gap-5">
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

        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted hidden sm:block">{username}</span>
            <button
              onClick={logout}
              className="text-xs font-black text-red-400 hover:text-red-500 transition-colors"
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

        <button onClick={toggleTheme} className="text-muted hover:text-accent transition-colors p-1">
          <i className={`fa-solid ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`} />
        </button>

        <button className="text-xl text-muted hover:text-accent transition-colors ml-1" aria-label="Open menu">
          <i className="fa-solid fa-bars" />
        </button>
      </div>
    </header>
  )
}

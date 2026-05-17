import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-darker border-t border-gray-800/50 mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/favicon.svg" alt="" className="w-6 h-6 rounded-md" />
              <span className="font-black text-lg text-accent tracking-wide">Reader's Haven</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              A modern, ad-free manga reading experience powered by the MangaDex API.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-3">Browse</h4>
            <div className="flex flex-col gap-2">
              <Link to="/search" className="text-xs text-muted hover:text-accent transition-colors">Explore Catalog</Link>
              <Link to="/search?type=manga" className="text-xs text-muted hover:text-accent transition-colors">Manga</Link>
              <Link to="/search?type=manhwa" className="text-xs text-muted hover:text-accent transition-colors">Manhwa</Link>
              <Link to="/search?order=latest" className="text-xs text-muted hover:text-accent transition-colors">New Releases</Link>
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-3">Community</h4>
            <div className="flex flex-col gap-2">
              <Link to="/forum" className="text-xs text-muted hover:text-accent transition-colors">Forum</Link>
              <a href="https://discord.gg/mangadex" target="_blank" rel="noopener noreferrer" className="text-xs text-muted hover:text-accent transition-colors">
                Discord
              </a>
              <a href="https://github.com/rianjordan/manga" target="_blank" rel="noopener noreferrer" className="text-xs text-muted hover:text-accent transition-colors">
                GitHub
              </a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-3">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link to="/terms" className="text-xs text-muted hover:text-accent transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="text-xs text-muted hover:text-accent transition-colors">Privacy Policy</Link>
              <a href="https://mangadex.org" target="_blank" rel="noopener noreferrer" className="text-xs text-muted hover:text-accent transition-colors">
                MangaDex
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800/50 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-xs text-muted/60">
            Reader's Haven &copy; {new Date().getFullYear()} · Powered by{' '}
            <a href="https://mangadex.org" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
              MangaDex
            </a>
          </span>
          <div className="flex items-center gap-4">
            <a href="https://github.com/rianjordan/manga" target="_blank" rel="noopener noreferrer" className="text-muted/50 hover:text-accent transition-colors">
              <i className="fa-brands fa-github text-lg" />
            </a>
            <a href="https://discord.gg/mangadex" target="_blank" rel="noopener noreferrer" className="text-muted/50 hover:text-accent transition-colors">
              <i className="fa-brands fa-discord text-lg" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

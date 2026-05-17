import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-darker border-t border-gray-800/50 py-6 px-6 md:px-10 mt-auto">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-wider text-accent">
            Reader's Haven &copy; 2026
          </span>
        </div>
        <div className="flex gap-5 text-muted text-sm">
          <span className="text-xs text-muted/60">
            Powered by{' '}
            <a href="https://mangadex.org" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
              MangaDex
            </a>
          </span>
          <Link to="/terms" className="hover:text-accent transition-colors">
            Terms
          </Link>
          <Link to="/privacy" className="hover:text-accent transition-colors">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  )
}

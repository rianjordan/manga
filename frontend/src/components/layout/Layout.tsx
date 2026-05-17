import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { ToastContainer } from '../ui/ToastContainer'
import { useAuth, useSettings } from '../../store'
import { useReadingHistory, useFollows } from '../../store/user-data'

export function Layout() {
  const { isLoggedIn } = useAuth()
  const { theme } = useSettings()
  const { fetchHistory, clearHistory } = useReadingHistory()
  const { fetchFollows, clearFollows } = useFollows()
  const location = useLocation()
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Apply light/dark mode class to document
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode')
    } else {
      document.documentElement.classList.remove('light-mode')
    }
  }, [theme])

  useEffect(() => {
    if (isLoggedIn) {
      fetchHistory()
      fetchFollows()
    } else {
      clearHistory()
      clearFollows()
    }
  }, [isLoggedIn])

  // Scroll-to-top visibility
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  if (isAuthPage) {
    return (
      <>
        <Outlet />
        <ToastContainer />
      </>
    )
  }

  return (
    <div 
      id="layout-root"
      className="min-h-screen flex flex-col text-white font-sans antialiased overflow-x-hidden transition-colors duration-300 pt-[68px]"
      style={{
        backgroundImage: `linear-gradient(rgba(12, 12, 12, 0.82), rgba(12, 12, 12, 0.82)), url('/img/website/bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Skip to main content — accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:bg-accent focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="w-full max-w-[1440px] mx-auto px-4 md:px-10 py-8 flex-grow page-enter">
        <Outlet key={location.pathname} />
      </main>
      <Footer />
      <ToastContainer />

      {/* Scroll-to-Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 w-12 h-12 rounded-full bg-accent text-white shadow-2xl shadow-accent/30 z-50 flex items-center justify-center transition-all duration-500 cursor-pointer hover:scale-110 active:scale-95 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <i className="fa-solid fa-arrow-up text-sm" />
      </button>
    </div>
  )
}

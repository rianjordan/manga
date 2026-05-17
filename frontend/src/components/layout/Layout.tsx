import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { useAuth, useSettings } from '../../store'
import { useReadingHistory, useFollows } from '../../store/user-data'

export function Layout() {
  const { isLoggedIn } = useAuth()
  const { theme } = useSettings()
  const { fetchHistory, clearHistory } = useReadingHistory()
  const { fetchFollows, clearFollows } = useFollows()
  const location = useLocation()

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

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  if (isAuthPage) {
    return <Outlet />
  }

  return (
    <div 
      id="layout-root"
      className="min-h-screen flex flex-col text-white font-sans antialiased overflow-x-hidden transition-colors duration-300"
      style={{
        backgroundImage: `linear-gradient(rgba(12, 12, 12, 0.82), rgba(12, 12, 12, 0.82)), url('/img/website/bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <Header />
      <main className="w-full max-w-[1440px] mx-auto px-4 md:px-10 py-8 flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

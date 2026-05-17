import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { useAuth } from '../../store'
import { useReadingHistory, useFollows } from '../../store/user-data'

export function Layout() {
  const { isLoggedIn } = useAuth()
  const { fetchHistory, clearHistory } = useReadingHistory()
  const { fetchFollows, clearFollows } = useFollows()
  const location = useLocation()

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
      className="min-h-screen flex flex-col text-white font-sans antialiased overflow-x-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(18, 18, 18, 0.92), rgba(18, 18, 18, 0.92)), url('/bg.jpg')`,
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

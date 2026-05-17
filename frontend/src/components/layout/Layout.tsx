import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { useAuth } from '../../store'
import { useReadingHistory, useFollows } from '../../store/user-data'

export function Layout() {
  const { isLoggedIn } = useAuth()
  const { fetchHistory, clearHistory } = useReadingHistory()
  const { fetchFollows, clearFollows } = useFollows()

  useEffect(() => {
    if (isLoggedIn) {
      fetchHistory()
      fetchFollows()
    } else {
      clearHistory()
      clearFollows()
    }
  }, [isLoggedIn])

  return (
    <div className="min-h-screen flex flex-col text-white font-sans antialiased overflow-x-hidden bg-dark">
      <div className="fixed inset-0 bg-[url('/bg.jpg')] bg-cover bg-center bg-fixed bg-repeat opacity-[0.08] pointer-events-none -z-10" />
      <Header />
      <main className="w-full max-w-[1440px] mx-auto px-4 md:px-10 py-8 flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

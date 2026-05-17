import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/layout/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { HomePage } from './pages/Home'
import { SearchPage } from './pages/Search'
import { MangaDetailPage } from './pages/MangaDetail'
import { LibraryPage } from './pages/Library'
import { ReaderPage } from './pages/Reader'
import { LoginPage } from './pages/Login'
import { SignupPage } from './pages/Signup'
import { NotFoundPage } from './pages/NotFound'
import { ForumPage } from './pages/Forum' // Refresh module cache
import { AboutPage } from './pages/About'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/manga/:id" element={<MangaDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/forum/category/:categoryId" element={<ForumPage />} />
              <Route path="/forum/thread/:threadId" element={<ForumPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/terms" element={<AboutPage />} />
              <Route path="/privacy" element={<AboutPage />} />
              <Route path="/dmca" element={<AboutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="/reader/:chapterId" element={<ReaderPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App

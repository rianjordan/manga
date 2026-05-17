import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useChapterPages, useChapter } from '../hooks/useManga'
import { imageUrl } from '../lib/api'
import { useSettings } from '../store'
import { useReadingHistory } from '../store/user-data'

export function ReaderPage() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const navigate = useNavigate()
  const { data: pagesData, isLoading: pagesLoading } = useChapterPages(chapterId!)
  const { data: chapterData } = useChapter(chapterId!)
  const { readerMode, imageQuality } = useSettings()
  const { addEntry } = useReadingHistory()

  const [currentPage, setCurrentPage] = useState(0)
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([0, 1, 2]))
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const pages = pagesData?.chapter
  const imageList = pages ? (imageQuality === 'data-saver' ? pages.dataSaver : pages.data) : []
  const hash = pages?.hash ?? ''
  const qualityPath = imageQuality === 'data-saver' ? 'data-saver' : 'data'

  const mangaRel = chapterData?.data?.relationships?.find((r: { type: string }) => r.type === 'manga')
  const mangaTitle = (mangaRel?.attributes as { title?: Record<string, string> } | undefined)?.title?.en
  const chapterNum = chapterData?.data?.attributes?.chapter
  const chapterTitle = chapterData?.data?.attributes?.title

  // Track reading progress
  useEffect(() => {
    if (!chapterId || !mangaTitle) return
    addEntry({
      mangaId: chapterData?.data?.relationships?.find((r) => r.type === 'manga')?.id ?? '',
      mangaTitle: mangaTitle ?? 'Manga',
      coverFile: '',
      chapterId,
      chapterNumber: chapterNum ?? null,
      page: currentPage + 1,
      readAt: new Date().toISOString(),
    })
  }, [currentPage, chapterId, mangaTitle])

  // Preload images
  useEffect(() => {
    if (imageList.length === 0) return
    const preloadRange = 5
    const newLoaded = new Set(loadedPages)
    for (let i = currentPage; i < Math.min(currentPage + preloadRange, imageList.length); i++) {
      newLoaded.add(i)
    }
    setLoadedPages(newLoaded)

    // Preload images
    for (let i = currentPage + 1; i < Math.min(currentPage + preloadRange, imageList.length); i++) {
      if (!loadedPages.has(i)) {
        const img = new Image()
        img.src = imageUrl(`${qualityPath}/${hash}/${imageList[i]}`)
      }
    }
  }, [currentPage, imageList, hash, qualityPath])

  const goToPage = useCallback(
    (page: number) => {
      if (page < 0 || page >= imageList.length) return
      setCurrentPage(page)
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'instant' })
      }
    },
    [imageList.length],
  )

  const goNext = useCallback(() => {
    if (currentPage < imageList.length - 1) {
      goToPage(currentPage + 1)
    }
  }, [currentPage, imageList.length, goToPage])

  const goPrev = useCallback(() => {
    if (currentPage > 0) {
      goToPage(currentPage - 1)
    }
  }, [currentPage, goToPage])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        if (readerMode === 'scroll') return
        goNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (readerMode === 'scroll') return
        goPrev()
      } else if (e.key === 'f') {
        e.preventDefault()
        toggleFullscreen()
      } else if (e.key === 'Escape') {
        if (isFullscreen) document.exitFullscreen()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev, readerMode, isFullscreen])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Chapter Image Downloader
  const downloadChapter = async () => {
    if (isDownloading || imageList.length === 0) return
    setIsDownloading(true)
    try {
      const sanitizedTitle = (mangaTitle ?? 'manga').replace(/[^a-zA-Z0-9]/g, '_')
      for (let i = 0; i < imageList.length; i++) {
        const url = imageUrl(`${qualityPath}/${hash}/${imageList[i]}`)
        const response = await fetch(url)
        const blob = await response.blob()
        const blobUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = `${sanitizedTitle}_ch${chapterNum ?? '0'}_page-${String(i + 1).padStart(3, '0')}.jpg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
        await new Promise((r) => setTimeout(r, 200)) // 200ms delay to keep download queue orderly
      }
    } catch (e) {
      console.error('Failed to download images:', e)
    } finally {
      setIsDownloading(false)
    }
  }

  if (pagesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!pages || imageList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted">No pages available for this chapter.</p>
        <Link to="/" className="text-accent hover:underline">
          Back to Home
        </Link>
      </div>
    )
  }

  if (readerMode === 'scroll') {
    return (
      <ScrollReader
        hash={hash}
        imageList={imageList}
        mangaTitle={mangaTitle}
        chapterNum={chapterNum}
        chapterTitle={chapterTitle}
        goPrev={goPrev}
        navigate={navigate}
        chapterId={chapterId!}
        downloadChapter={downloadChapter}
        isDownloading={isDownloading}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-accent transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left text-lg" />
          </button>
          <div className="text-white text-sm">
            <span className="font-semibold">{mangaTitle ?? 'Manga'}</span>
            {chapterNum && <span className="text-muted ml-2">Ch. {chapterNum}</span>}
            {chapterTitle && <span className="text-muted ml-2">&mdash; {chapterTitle}</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadChapter}
            disabled={isDownloading}
            className="text-white hover:text-accent disabled:opacity-50 transition-colors flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg cursor-pointer"
            title="Download Chapter Pages"
          >
            {isDownloading ? (
              <div className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <i className="fa-solid fa-download" />
            )}
            {isDownloading ? 'DOWNLOADING...' : 'DOWNLOAD'}
          </button>
          <span className="text-white text-sm">
            {currentPage + 1} / {imageList.length}
          </span>
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-accent transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-expand" />
          </button>
        </div>
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = e.clientX - rect.left
          const width = rect.width
          if (x < width / 3) goPrev()
          else if (x > (width * 2) / 3) goNext()
        }}
      >
        {loadedPages.has(currentPage) ? (
          <img
            src={imageUrl(`${qualityPath}/${hash}/${imageList[currentPage]}`)}
            alt={`Page ${currentPage + 1}`}
            className="max-h-full max-w-full object-contain select-none"
            draggable={false}
          />
        ) : (
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        )}

        {/* Side hints */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
          <i className="fa-solid fa-chevron-left text-white/30 text-3xl" />
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
          <i className="fa-solid fa-chevron-right text-white/30 text-3xl" />
        </div>
      </div>

      {/* Bottom progress bar */}
      <div className="h-1 bg-gray-800">
        <div
          className="h-full bg-accent transition-all duration-200"
          style={{ width: `${((currentPage + 1) / imageList.length) * 100}%` }}
        />
      </div>
    </div>
  )
}

function ScrollReader({
  hash,
  imageList,
  mangaTitle,
  chapterNum,
  chapterTitle,
  goPrev,
  navigate,
  chapterId,
  downloadChapter,
  isDownloading,
}: {
  hash: string
  imageList: string[]
  mangaTitle?: string
  chapterNum?: string | null
  chapterTitle?: string | null
  goPrev: () => void
  navigate: (path: number) => void
  chapterId: string
  downloadChapter: () => Promise<void>
  isDownloading: boolean
}) {
  const { imageQuality } = useSettings()
  const qualityPath = imageQuality === 'data-saver' ? 'data-saver' : 'data'
  const [showUI, setShowUI] = useState(true)
  let uiTimer: ReturnType<typeof setTimeout>

  const handleMouseMove = () => {
    setShowUI(true)
    clearTimeout(uiTimer)
    uiTimer = setTimeout(() => setShowUI(false), 2000)
  }

  useEffect(() => {
    return () => clearTimeout(uiTimer)
  }, [])

  return (
    <div className="min-h-screen bg-dark" onMouseMove={handleMouseMove}>
      {/* Top bar */}
      <div
        className={`sticky top-0 z-40 bg-darker/95 backdrop-blur-md border-b border-gray-800/60 p-4 flex items-center justify-between transition-opacity duration-300 ${
          showUI ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-accent transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left text-lg" />
          </button>
          <div className="text-white text-sm">
            <span className="font-semibold">{mangaTitle ?? 'Manga'}</span>
            {chapterNum && <span className="text-muted ml-2">Ch. {chapterNum}</span>}
            {chapterTitle && <span className="text-muted ml-2">&mdash; {chapterTitle}</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadChapter}
            disabled={isDownloading}
            className="text-white hover:text-accent disabled:opacity-50 transition-colors flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg cursor-pointer"
            title="Download Chapter Pages"
          >
            {isDownloading ? (
              <div className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <i className="fa-solid fa-download" />
            )}
            {isDownloading ? 'DOWNLOADING...' : 'DOWNLOAD'}
          </button>
        </div>
      </div>

      {/* Images */}
      <div className="max-w-3xl mx-auto px-4 py-4 flex flex-col gap-2">
        {imageList.map((img, i) => (
          <ImagePage
            key={i}
            src={imageUrl(`${qualityPath}/${hash}/${img}`)}
            alt={`Page ${i + 1}`}
            index={i}
          />
        ))}
      </div>

      {/* Bottom nav */}
      <div className="max-w-3xl mx-auto px-4 pb-8 flex justify-center gap-4">
        <button
          onClick={goPrev}
          className="bg-card hover:bg-gray-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
        >
          <i className="fa-solid fa-chevron-left mr-2" />
          Previous Chapter
        </button>
        <Link
          to={`/manga/${chapterId}`}
          className="bg-accent hover:bg-pink-500 text-dark px-6 py-3 rounded-xl text-sm font-bold transition-all"
        >
          Back to Details
        </Link>
      </div>
    </div>
  )
}

function ImagePage({ src, alt, index }: { src: string; alt: string; index: number }) {
  return (
    <div className="w-full">
      <img
        src={src}
        alt={alt}
        className="w-full h-auto rounded-lg"
        loading={index < 3 ? 'eager' : 'lazy'}
      />
    </div>
  )
}

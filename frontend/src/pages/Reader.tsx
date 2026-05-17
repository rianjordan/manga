import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useChapterPages, useChapter, useMangaFeed } from '../hooks/useManga'
import { imageUrl } from '../lib/api'
import { useSettings } from '../store'
import { useReadingHistory } from '../store/user-data'

export function ReaderPage() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const navigate = useNavigate()
  const { data: pagesData, isLoading: pagesLoading } = useChapterPages(chapterId!)
  const { data: chapterData } = useChapter(chapterId!)
  const { readerMode, imageQuality } = useSettings()
  const { addEntry, history } = useReadingHistory()

  const [currentPage, setCurrentPage] = useState(0)
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([0, 1, 2]))
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showChapterModal, setShowChapterModal] = useState(false)
  const [modalSearch, setModalSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const pages = pagesData?.chapter
  const imageList = pages ? (imageQuality === 'data-saver' ? pages.dataSaver : pages.data) : []
  const hash = pages?.hash ?? ''
  const qualityPath = imageQuality === 'data-saver' ? 'data-saver' : 'data'

  const mangaRel = chapterData?.data?.relationships?.find((r: { type: string }) => r.type === 'manga')
  const mangaId = mangaRel?.id ?? ''
  const mangaTitle = (mangaRel?.attributes as { title?: Record<string, string> } | undefined)?.title?.en
  const chapterNum = chapterData?.data?.attributes?.chapter
  const chapterTitle = chapterData?.data?.attributes?.title
  const currentLang = chapterData?.data?.attributes?.translatedLanguage ?? 'en'

  // Fetch sibling chapters for next/prev navigation
  const { data: feedData } = useMangaFeed(mangaId, { limit: 500 }, { enabled: !!mangaId })
  const allChapters = feedData?.data ?? []
  const filteredChapters = allChapters.filter((ch) => ch.attributes.translatedLanguage === currentLang)

  const sortedChapters = [...filteredChapters].sort((a, b) => {
    const aNum = parseFloat(a.attributes.chapter ?? '0')
    const bNum = parseFloat(b.attributes.chapter ?? '0')
    return aNum - bNum
  })

  const currentIndex = sortedChapters.findIndex((ch) => ch.id === chapterId)
  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null
  const nextChapter = currentIndex < sortedChapters.length - 1 && currentIndex !== -1 ? sortedChapters[currentIndex + 1] : null

  const filteredModalChapters = sortedChapters.filter((ch) => {
    if (!modalSearch.trim()) return true
    const searchLower = modalSearch.toLowerCase()
    const chNum = ch.attributes.chapter ?? ''
    const chTitle = ch.attributes.title ?? ''
    return chNum.toLowerCase().includes(searchLower) || chTitle.toLowerCase().includes(searchLower)
  }).reverse()

  const renderChapterModal = () => {
    if (!showChapterModal) return null
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer transition-opacity duration-300"
          onClick={() => setShowChapterModal(false)}
        />
        
        {/* Modal Content */}
        <div className="relative w-full max-w-xl bg-[#151518]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[75vh] overflow-hidden transform transition-all duration-300 scale-100 animate-scale-up">
          {/* Modal Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-white font-black text-lg uppercase tracking-tight">Jump to Chapter</h3>
              <p className="text-muted text-[10px] font-bold uppercase tracking-wider mt-0.5 line-clamp-1">{mangaTitle}</p>
            </div>
            <button
              onClick={() => setShowChapterModal(false)}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white hover:text-accent transition-colors flex items-center justify-center cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4 border-b border-white/5 bg-black/35">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-muted text-xs" />
              <input
                type="text"
                placeholder="Search chapter number or title..."
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-accent rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-muted focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Chapters List */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {filteredModalChapters.length === 0 ? (
              <div className="py-12 text-center text-muted text-xs font-semibold">
                No chapters found.
              </div>
            ) : (
              filteredModalChapters.map((ch) => {
                const chNum = ch.attributes.chapter
                const chTitle = ch.attributes.title
                const isCurrent = ch.id === chapterId
                const isRead = history.some((h) => h.chapterId === ch.id)

                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setShowChapterModal(false)
                      navigate(`/reader/${ch.id}`)
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all duration-300 group cursor-pointer ${
                      isCurrent
                        ? 'bg-accent/15 border-accent text-accent shadow-lg shadow-accent/5'
                        : 'bg-white/5 hover:bg-white/10 border-white/5 text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <span className={`text-xs font-black tracking-wide block ${isCurrent ? 'text-accent' : 'text-white'}`}>
                        Chapter {chNum ?? '0'}
                      </span>
                      {chTitle && (
                        <span className="text-[10px] text-muted group-hover:text-gray-400 line-clamp-1 mt-0.5 font-medium">
                          {chTitle}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {isRead && !isCurrent && (
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          ✓ READ
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[10px] font-black text-accent bg-accent/20 px-2 py-0.5 rounded-md border border-accent/30 animate-pulse">
                          READING
                        </span>
                      )}
                      <i className="fa-solid fa-chevron-right text-[10px] text-muted group-hover:text-accent transition-colors" />
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>
    )
  }

  // Reset page index on chapter change
  useEffect(() => {
    setCurrentPage(0)
    setLoadedPages(new Set([0, 1, 2]))
  }, [chapterId])

  // Track reading progress
  useEffect(() => {
    if (!chapterId || !mangaTitle) return
    addEntry({
      mangaId,
      mangaTitle: mangaTitle ?? 'Manga',
      coverFile: '',
      chapterId,
      chapterNumber: chapterNum ?? null,
      page: currentPage + 1,
      readAt: new Date().toISOString(),
    })
  }, [currentPage, chapterId, mangaTitle, mangaId])

  // Preload images
  useEffect(() => {
    if (imageList.length === 0) return
    const preloadRange = 5
    const newLoaded = new Set(loadedPages)
    for (let i = currentPage; i < Math.min(currentPage + preloadRange, imageList.length); i++) {
      newLoaded.add(i)
    }
    setLoadedPages(newLoaded)

    // Preload images in background
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
      <div className="flex items-center justify-center py-20 min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!pages || imageList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 min-h-[60vh]">
        <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-xl text-accent shadow-lg shadow-accent/5">
          <i className="fa-solid fa-file-circle-exclamation" />
        </div>
        <p className="text-muted text-sm font-semibold">No pages available for this chapter.</p>
        <Link to={`/manga/${mangaId}`} className="bg-accent hover:bg-pink-500 text-dark font-black px-6 py-2.5 rounded-xl text-xs tracking-wider transition-all">
          BACK TO DETAILS
        </Link>
      </div>
    )
  }

  if (readerMode === 'scroll') {
    return (
      <>
        <ScrollReader
          hash={hash}
          imageList={imageList}
          mangaTitle={mangaTitle}
          chapterNum={chapterNum}
          chapterTitle={chapterTitle}
          navigate={navigate}
          mangaId={mangaId}
          downloadChapter={downloadChapter}
          isDownloading={isDownloading}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
          volume={chapterData?.data?.attributes?.volume}
          onShowChapters={() => setShowChapterModal(true)}
        />
        {renderChapterModal()}
      </>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-darker/90 backdrop-blur-md border-b border-gray-800/60 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={`/manga/${mangaId}`}
            className="text-white hover:text-accent transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left text-lg" />
          </Link>
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
            className="text-white hover:text-accent disabled:opacity-50 transition-colors flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl cursor-pointer"
            title="Download Chapter Pages"
          >
            {isDownloading ? (
              <div className="w-3.5 h-3.5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <i className="fa-solid fa-download" />
            )}
            {isDownloading ? 'DOWNLOADING...' : 'DOWNLOAD'}
          </button>
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-accent transition-colors p-2 rounded-xl bg-white/10 hover:bg-white/20 cursor-pointer"
          >
            <i className="fa-solid fa-expand text-xs" />
          </button>
        </div>
      </div>

      {/* Floating Volume / Chapter info header above the image */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 bg-black/75 backdrop-blur-md px-5 py-2 rounded-full border border-white/10 text-center flex items-center gap-2.5 shadow-lg">
        <span className="text-[11px] font-black text-accent uppercase tracking-wider">
          {chapterData?.data?.attributes?.volume ? `Volume ${chapterData.data.attributes.volume}` : 'No Volume'}
        </span>
        <div className="w-1 h-1.5 bg-white/30 rounded-full" />
        <span className="text-[11px] font-black text-white uppercase tracking-wider">
          Chapter {chapterNum ?? '0'} {chapterTitle ? `— ${chapterTitle}` : ''}
        </span>
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden relative cursor-pointer group"
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
            className="max-h-full max-w-full object-contain select-none mt-10"
            draggable={false}
          />
        ) : (
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        )}

        {/* Side hints */}
        {currentPage > 0 && (
          <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 w-12 h-12 rounded-full bg-black/40 border border-white/5 flex items-center justify-center text-white/60">
            <i className="fa-solid fa-chevron-left text-lg" />
          </div>
        )}
        {currentPage < imageList.length - 1 && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 w-12 h-12 rounded-full bg-black/40 border border-white/5 flex items-center justify-center text-white/60">
            <i className="fa-solid fa-chevron-right text-lg" />
          </div>
        )}
      </div>

      {/* Bottom floating nav bar for chapter and page navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-black/75 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 flex items-center gap-6 shadow-2xl">
        {prevChapter ? (
          <Link
            to={`/reader/${prevChapter.id}`}
            className="text-white hover:text-accent transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Previous Chapter"
          >
            <i className="fa-solid fa-angles-left" />
            <span>Prev Ch</span>
          </Link>
        ) : (
          <span className="text-white/20 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed">
            <i className="fa-solid fa-angles-left" />
            <span>Prev Ch</span>
          </span>
        )}

        <div className="h-4 w-px bg-white/20" />

        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={currentPage === 0}
            className="text-white hover:text-accent disabled:opacity-20 transition-colors p-1 cursor-pointer"
            title="Previous Page"
          >
            <i className="fa-solid fa-chevron-left text-sm" />
          </button>
          <span className="text-white text-xs font-black tracking-wide min-w-[70px] text-center">
            {currentPage + 1} / {imageList.length}
          </span>
          <button
            onClick={goNext}
            disabled={currentPage === imageList.length - 1}
            className="text-white hover:text-accent disabled:opacity-20 transition-colors p-1 cursor-pointer"
            title="Next Page"
          >
            <i className="fa-solid fa-chevron-right text-sm" />
          </button>
        </div>

        <div className="h-4 w-px bg-white/20" />

        {/* Dynamic Chapter List Trigger Button for Single Page Mode! */}
        <button
          onClick={() => setShowChapterModal(true)}
          className="text-white hover:text-accent transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
          title="Open Chapter List"
        >
          <i className="fa-solid fa-list-ul text-xs" />
          <span>Chapters</span>
        </button>

        <div className="h-4 w-px bg-white/20" />

        {nextChapter ? (
          <Link
            to={`/reader/${nextChapter.id}`}
            className="text-accent hover:text-pink-400 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Next Chapter"
          >
            <span>Next Ch</span>
            <i className="fa-solid fa-angles-right" />
          </Link>
        ) : (
          <span className="text-white/20 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed">
            <span>Next Ch</span>
            <i className="fa-solid fa-angles-right" />
          </span>
        )}
      </div>

      {renderChapterModal()}

      {/* Bottom progress bar */}
      <div className="h-1.5 bg-gray-800">
        <div
          className="h-full bg-accent transition-all duration-200 shadow-[0_0_10px_rgba(214,51,108,0.5)]"
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
  mangaId,
  downloadChapter,
  isDownloading,
  prevChapter,
  nextChapter,
  volume,
  onShowChapters,
}: {
  hash: string
  imageList: string[]
  mangaTitle?: string
  chapterNum?: string | null
  chapterTitle?: string | null
  navigate: any
  mangaId: string
  downloadChapter: () => Promise<void>
  isDownloading: boolean
  prevChapter: any
  nextChapter: any
  volume?: string | null
  onShowChapters: () => void
}) {
  const { imageQuality } = useSettings()
  const qualityPath = imageQuality === 'data-saver' ? 'data-saver' : 'data'
  const [showUI, setShowUI] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseMove = () => {
    setShowUI(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setShowUI(false), 2000)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div className="min-h-screen bg-black" onMouseMove={handleMouseMove}>
      {/* Top bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 bg-darker/95 backdrop-blur-md border-b border-gray-800/60 p-4 flex items-center justify-between transition-all duration-300 ${
          showUI ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="flex items-center gap-4">
          <Link
            to={`/manga/${mangaId}`}
            className="text-white hover:text-accent transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left text-lg" />
          </Link>
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
            className="text-white hover:text-accent disabled:opacity-50 transition-colors flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl cursor-pointer"
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

      {/* Spacing for absolute header */}
      <div className="h-16" />

      {/* Premium Header above scroll panels */}
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-4 text-center">
        <span className="text-xs font-black text-accent uppercase tracking-widest block mb-1">Currently Reading</span>
        <h1 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">
          {mangaTitle ?? 'Manga'}
        </h1>
        <p className="text-muted text-sm mt-1 font-bold">
          {volume ? `Volume ${volume} ` : ''}Chapter {chapterNum ?? '0'} {chapterTitle ? `— ${chapterTitle}` : ''}
        </p>
        <div className="w-12 h-1 bg-accent mx-auto mt-4 rounded-full" />
      </div>

      {/* Images container */}
      <div className="max-w-3xl mx-auto px-2 py-4 flex flex-col gap-3">
        {imageList.map((img, i) => (
          <ImagePage
            key={img}
            src={imageUrl(`${qualityPath}/${hash}/${img}`)}
            alt={`Page ${i + 1}`}
            index={i}
          />
        ))}
      </div>

      {/* Bottom chapter navigation */}
      <div className="max-w-3xl mx-auto px-4 py-12 flex justify-center gap-4">
        {prevChapter ? (
          <Link
            to={`/reader/${prevChapter.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-[#202020] hover:bg-gray-800 text-white hover:text-accent px-6 py-3.5 rounded-xl text-sm font-bold border border-gray-800/60 transition-all hover:shadow-lg"
          >
            <i className="fa-solid fa-backward-step text-xs" />
            Prev Chapter
          </Link>
        ) : (
          <button
            disabled
            className="flex-1 flex items-center justify-center gap-2 bg-[#202020]/40 text-muted/40 px-6 py-3.5 rounded-xl text-sm font-bold border border-transparent cursor-not-allowed"
          >
            <i className="fa-solid fa-backward-step text-xs" />
            No Prev Chapter
          </button>
        )}

        <button
          onClick={onShowChapters}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-800/60 hover:border-accent/40 bg-[#121212] hover:bg-accent/5 text-muted hover:text-accent px-6 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
        >
          <i className="fa-solid fa-list-ul text-xs" />
          Chapter List
        </button>

        {nextChapter ? (
          <Link
            to={`/reader/${nextChapter.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-pink-500 text-dark px-6 py-3.5 rounded-xl text-sm font-black transition-all hover:shadow-lg hover:shadow-accent/20"
          >
            Next Chapter
            <i className="fa-solid fa-forward-step text-xs" />
          </Link>
        ) : (
          <button
            disabled
            className="flex-1 flex items-center justify-center gap-2 bg-accent/20 text-accent/30 px-6 py-3.5 rounded-xl text-sm font-black cursor-not-allowed"
          >
            No Next Chapter
            <i className="fa-solid fa-forward-step text-xs" />
          </button>
        )}
      </div>
    </div>
  )
}

function ImagePage({ src, alt, index }: { src: string; alt: string; index: number }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <div className="w-full min-h-[300px] flex items-center justify-center relative bg-[#121212] rounded-xl overflow-hidden border border-gray-800/20">
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
          <i className="fa-solid fa-circle-exclamation text-red-500 text-xl" />
          <p className="text-xs text-muted">Failed to load panel page.</p>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-auto object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading={index < 3 ? 'eager' : 'lazy'}
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store'
import { api } from '../lib/api'

interface ForumCategory {
  id: number
  name: string
  description: string
  threadsCount: number
  postsCount: number
}

interface ForumThread {
  id: number
  title: string
  content: string
  viewsCount: number
  repliesCount: number
  createdAt: string
  updatedAt: string
  username: string
  avatarUrl: string | null
  userId: string
  categoryName?: string
}

interface ForumPost {
  id: number
  content: string
  createdAt: string
  username: string
  avatarUrl: string | null
  userId: string
}

export function ForumPage() {
  const { categoryId, threadId } = useParams<{ categoryId?: string; threadId?: string }>()
  const { isLoggedIn, username: currentUsername } = useAuth()
  const navigate = useNavigate()

  // State Management
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [activeThread, setActiveThread] = useState<ForumThread | null>(null)
  const [posts, setPosts] = useState<ForumPost[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Creation Forms State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newReplyContent, setNewReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fetch Category details
  const activeCategory = categories.find((c) => c.id === Number(categoryId))

  // Relative Time helper
  const formatTimeAgo = (dateStr: string) => {
    const elapsed = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(elapsed / 60000)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)

    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  // 1. Fetch Categories
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await api.get<{ data: ForumCategory[] }>('/forum/categories')
      if (res && res.data) {
        setCategories(res.data)
      }
    } catch (err: any) {
      console.error('Failed to load forum categories:', err)
      setError('Could not load forum categories.')
    } finally {
      setLoading(false)
    }
  }

  // 2. Fetch Threads for a Category
  const fetchThreads = async (catId: string) => {
    try {
      setLoading(true)
      const res = await api.get<{ data: ForumThread[] }>(`/forum/threads`, { categoryId: catId })
      if (res && res.data) {
        setThreads(res.data)
      }
    } catch (err: any) {
      console.error('Failed to load threads:', err)
      setError('Could not load discussion threads.')
    } finally {
      setLoading(false)
    }
  }

  // 3. Fetch Single Thread & Replies
  const fetchThreadAndReplies = async (thId: string) => {
    try {
      setLoading(true)
      const threadRes = await api.get<{ data: ForumThread }>(`/forum/threads/${thId}`)
      if (threadRes && threadRes.data) {
        setActiveThread(threadRes.data)
      }

      const postsRes = await api.get<{ data: ForumPost[] }>(`/forum/threads/${thId}/posts`)
      if (postsRes && postsRes.data) {
        setPosts(postsRes.data)
      }
    } catch (err: any) {
      console.error('Failed to load thread details:', err)
      setError('Could not load thread discussions.')
    } finally {
      setLoading(false)
    }
  }

  // Effect to decide what to fetch
  useEffect(() => {
    setError('')
    if (threadId) {
      fetchThreadAndReplies(threadId)
    } else if (categoryId) {
      // Fetch categories list first for breadcrumb context
      if (categories.length === 0) {
        fetchCategories()
      }
      fetchThreads(categoryId)
    } else {
      fetchCategories()
    }
  }, [categoryId, threadId])

  // Submit Thread Topic Handler
  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim() || !categoryId) return

    try {
      setSubmitting(true)
      const res = await api.post<{ success: boolean; id: number }>('/forum/threads', {
        categoryId: Number(categoryId),
        title: newTitle.trim(),
        content: newContent.trim(),
      })

      if (res && res.success) {
        setNewTitle('')
        setNewContent('')
        setShowCreateModal(false)
        fetchThreads(categoryId) // Refresh threads
      }
    } catch (err: any) {
      alert(err.message || 'Failed to post discussion topic.')
    } finally {
      setSubmitting(false)
    }
  }

  // Submit Thread Reply Handler
  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReplyContent.trim() || !threadId) return

    try {
      setSubmitting(true)
      const res = await api.post<{ success: boolean }>(`/forum/threads/${threadId}/posts`, {
        content: newReplyContent.trim(),
      })

      if (res && res.success) {
        setNewReplyContent('')
        // Refresh replies
        const postsRes = await api.get<{ data: ForumPost[] }>(`/forum/threads/${threadId}/posts`)
        if (postsRes && postsRes.data) {
          setPosts(postsRes.data)
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to post reply.')
    } finally {
      setSubmitting(false)
    }
  }

  // Delete Thread Topic Handler
  const handleDeleteThread = async () => {
    if (!threadId || !activeThread) return
    if (!confirm('Are you sure you want to delete this discussion thread and all its replies?')) return

    try {
      const res = await api.delete<{ success: boolean }>(`/forum/threads/${threadId}`)
      if (res && res.success) {
        navigate(`/forum/category/${activeThread.userId}`) // Fallback back to category list
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete discussion thread.')
    }
  }

  // Delete Reply Handler
  const handleDeleteReply = async (replyId: number) => {
    if (!confirm('Are you sure you want to delete this reply?')) return

    try {
      const res = await api.delete<{ success: boolean }>(`/forum/posts/${replyId}`)
      if (res && res.success) {
        // Filter out locally
        setPosts(posts.filter((p) => p.id !== replyId))
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete reply.')
    }
  }

  // Category Icon helper
  const categoryIcon = (id: number) => {
    switch (id) {
      case 1:
        return 'fa-bullhorn text-amber-400 bg-amber-500/10'
      case 2:
        return 'fa-comments text-blue-400 bg-blue-500/10'
      case 3:
        return 'fa-wand-magic-sparkles text-purple-400 bg-purple-500/10'
      default:
        return 'fa-lightbulb text-emerald-400 bg-emerald-500/10'
    }
  }

  return (
    <div className="min-h-screen bg-darker text-white pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      {/* 1. Forum Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider mb-6 bg-card/40 border border-white/5 py-3 px-4 md:px-6 rounded-2xl backdrop-blur-md">
        <Link to="/forum" className="hover:text-accent transition-colors flex items-center gap-1.5">
          <i className="fa-solid fa-comments text-xs" />
          <span>Forum</span>
        </Link>
        {categoryId && (
          <>
            <i className="fa-solid fa-chevron-right text-[8px]" />
            <Link to={`/forum/category/${categoryId}`} className="hover:text-accent transition-colors">
              {activeCategory?.name || `Category #${categoryId}`}
            </Link>
          </>
        )}
        {threadId && activeThread && (
          <>
            <i className="fa-solid fa-chevron-right text-[8px]" />
            <span className="text-white truncate max-w-[200px] sm:max-w-xs">{activeThread.title}</span>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 mb-6">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-muted text-xs font-bold uppercase tracking-wider">Loading Discussions...</span>
        </div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════ */}
          {/* A. FORUM CATEGORIES LIST                            */}
          {/* ═══════════════════════════════════════════════════ */}
          {!categoryId && !threadId && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                    Community Forum
                  </h1>
                  <p className="text-muted text-sm font-medium mt-1">
                    Welcome to the Reader's Haven community. Join the conversation with readers around the world!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/forum/category/${cat.id}`}
                    className="group bg-card hover:bg-gray-800/40 border border-gray-800/80 hover:border-accent/30 p-6 rounded-2xl shadow-xl flex gap-5 items-start transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl transition-transform group-hover:scale-110 duration-300 ${categoryIcon(cat.id)}`}>
                      <i className={`fa-solid ${categoryIcon(cat.id).split(' ')[0]}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-black text-lg text-white group-hover:text-accent transition-colors flex items-center gap-2">
                        {cat.name}
                        <i className="fa-solid fa-arrow-right text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all text-accent" />
                      </h3>
                      <p className="text-muted text-xs font-semibold mt-1 leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-muted uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <i className="fa-solid fa-list text-[8px]" />
                          {cat.threadsCount} Threads
                        </span>
                        <span className="h-2.5 w-px bg-gray-800" />
                        <span className="flex items-center gap-1.5">
                          <i className="fa-solid fa-reply text-[8px]" />
                          {cat.postsCount} Replies
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* B. CATEGORY THREADS LIST                            */}
          {/* ═══════════════════════════════════════════════════ */}
          {categoryId && !threadId && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                    {activeCategory?.name || 'Discussion Category'}
                  </h1>
                  <p className="text-muted text-sm font-medium mt-1">
                    {activeCategory?.description || 'Browse or create discussion topics.'}
                  </p>
                </div>
                
                {isLoggedIn ? (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-accent hover:bg-accent-hover text-black text-xs font-black uppercase tracking-wider py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <i className="fa-solid fa-plus text-xs" />
                    New Topic
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="bg-card border border-white/10 hover:border-accent text-muted hover:text-white text-xs font-black uppercase tracking-wider py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <i className="fa-solid fa-right-to-bracket" />
                    Log in to Post
                  </Link>
                )}
              </div>

              {threads.length === 0 ? (
                <div className="bg-card border border-gray-800/80 rounded-2xl p-16 text-center shadow-xl">
                  <div className="w-16 h-16 bg-gray-800/30 rounded-full flex items-center justify-center text-muted text-2xl mx-auto mb-4 border border-white/5">
                    <i className="fa-solid fa-comments-question" />
                  </div>
                  <h3 className="font-black text-lg text-white">No discussions yet</h3>
                  <p className="text-muted text-xs font-semibold mt-1">Be the first to start a conversation in this category!</p>
                  {isLoggedIn && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="mt-5 bg-accent hover:bg-accent-hover text-black text-[10px] font-black uppercase tracking-wider py-3 px-5 rounded-lg transition-all cursor-pointer"
                    >
                      Start Thread
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-card border border-gray-800/80 rounded-2xl overflow-hidden divide-y divide-gray-800/60 shadow-xl">
                  {threads.map((thread) => (
                    <div
                      key={thread.id}
                      className="p-5 md:p-6 hover:bg-gray-800/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1 flex gap-4 items-start">
                        <img
                          src={thread.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${thread.username}`}
                          className="w-10 h-10 rounded-xl bg-gray-800 border border-white/5 flex-shrink-0"
                          alt={thread.username}
                        />
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/forum/thread/${thread.id}`}
                            className="font-black text-base text-white hover:text-accent transition-colors block line-clamp-1 cursor-pointer"
                          >
                            {thread.title}
                          </Link>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-xs text-muted font-semibold">
                            <span className="text-white/80">{thread.username}</span>
                            <span className="text-gray-700">•</span>
                            <span>{formatTimeAgo(thread.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Thread Stats */}
                      <div className="flex items-center gap-6 text-[10px] font-bold text-muted uppercase tracking-wider flex-shrink-0 border-t border-gray-800/40 md:border-none pt-3 md:pt-0">
                        <div className="flex flex-col items-center min-w-[50px]">
                          <span className="text-white text-sm font-black">{thread.repliesCount}</span>
                          <span className="text-[8px] mt-0.5">Replies</span>
                        </div>
                        <div className="flex flex-col items-center min-w-[50px]">
                          <span className="text-white text-sm font-black">{thread.viewsCount}</span>
                          <span className="text-[8px] mt-0.5">Views</span>
                        </div>
                        <Link
                          to={`/forum/thread/${thread.id}`}
                          className="w-8 h-8 rounded-xl bg-card border border-white/5 hover:border-accent hover:text-white flex items-center justify-center transition-colors cursor-pointer text-muted"
                        >
                          <i className="fa-solid fa-arrow-right text-xs" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/* C. THREAD DETAILS & POSTS VIEW                      */}
          {/* ═══════════════════════════════════════════════════ */}
          {threadId && activeThread && (
            <div className="flex flex-col gap-6">
              {/* Category tag & actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-card/30 border border-white/5 p-4 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/10 px-3.5 py-1.5 rounded-full">
                  {activeThread.categoryName || 'Discussions'}
                </span>
                
                {isLoggedIn && currentUsername === activeThread.username && (
                  <button
                    onClick={handleDeleteThread}
                    className="text-red-400 hover:text-red-500 font-bold text-xs flex items-center gap-1.5 cursor-pointer bg-red-500/5 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all"
                  >
                    <i className="fa-solid fa-trash-can text-xs" />
                    Delete Topic
                  </button>
                )}
              </div>

              {/* OP / Initial Thread Topic Post */}
              <div className="bg-card border border-gray-800/80 rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
                {/* Author Info Column */}
                <div className="flex md:flex-col items-center gap-3.5 flex-shrink-0 w-full md:w-32 border-b border-gray-800/60 md:border-none pb-4 md:pb-0">
                  <img
                    src={activeThread.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${activeThread.username}`}
                    className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gray-800 border-2 border-white/5 flex-shrink-0"
                    alt={activeThread.username}
                  />
                  <div className="min-w-0 text-left md:text-center">
                    <div className="font-black text-sm text-white line-clamp-1">{activeThread.username}</div>
                    <div className="text-[9px] font-black text-accent uppercase tracking-widest mt-0.5">Author</div>
                  </div>
                </div>

                {/* Content Box */}
                <div className="flex-1 min-w-0 flex flex-col gap-3">
                  <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                    {activeThread.title}
                  </h1>
                  <div className="text-muted text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span>Posted {formatTimeAgo(activeThread.createdAt)}</span>
                    <span>•</span>
                    <span>{activeThread.viewsCount} views</span>
                  </div>
                  <div className="h-px bg-gray-800/60 my-2" />
                  <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line font-medium">
                    {activeThread.content}
                  </p>
                </div>
              </div>

              {/* Comments / Replies Heading */}
              <div className="flex items-center gap-2 mt-4 text-xs font-bold text-muted uppercase tracking-wider">
                <i className="fa-solid fa-replies text-xs" />
                <span>Replies ({posts.length})</span>
              </div>

              {/* Replies Feed */}
              {posts.length === 0 ? (
                <div className="bg-card border border-white/5 rounded-2xl p-10 text-center text-muted text-xs font-semibold shadow-md">
                  No replies yet. Be the first to reply to this topic!
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-card/70 border border-gray-800/60 rounded-2xl p-5 md:p-6 shadow-lg flex gap-4 md:gap-5 items-start transition-all"
                    >
                      <img
                        src={post.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${post.username}`}
                        className="w-10 h-10 rounded-xl bg-gray-800 border border-white/5 flex-shrink-0"
                        alt={post.username}
                      />
                      
                      <div className="min-w-0 flex-1 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-white">{post.username}</span>
                            {post.username === activeThread.username && (
                              <span className="text-[8px] font-black text-accent uppercase tracking-widest bg-accent/15 border border-accent/20 px-2 py-0.5 rounded">OP</span>
                            )}
                            <span className="text-[10px] text-muted font-bold">{formatTimeAgo(post.createdAt)}</span>
                          </div>
                          
                          {isLoggedIn && currentUsername === post.username && (
                            <button
                              onClick={() => handleDeleteReply(post.id)}
                              className="text-red-400/80 hover:text-red-500 transition-colors p-1 cursor-pointer"
                              title="Delete reply"
                            >
                              <i className="fa-solid fa-trash text-xs" />
                            </button>
                          )}
                        </div>
                        
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line font-medium">
                          {post.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Replies Composer Form */}
              <div className="bg-card border border-gray-800/80 rounded-2xl p-6 md:p-8 shadow-xl mt-2 flex flex-col gap-4">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <i className="fa-solid fa-reply text-xs text-accent" />
                  <span>Join the Discussion</span>
                </div>

                {isLoggedIn ? (
                  <form onSubmit={handleCreateReply} className="flex flex-col gap-4">
                    <textarea
                      value={newReplyContent}
                      onChange={(e) => setNewReplyContent(e.target.value)}
                      placeholder="Write your reply..."
                      className="w-full min-h-[120px] bg-[#2A2A2A] border border-gray-700/50 rounded-2xl p-4 text-sm text-white placeholder-gray-500 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-medium"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting || !newReplyContent.trim()}
                        className="bg-accent hover:bg-accent-hover disabled:bg-accent/30 disabled:text-black/50 text-black text-xs font-black uppercase tracking-wider py-3.5 px-6 rounded-xl flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
                      >
                        {submitting ? (
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <i className="fa-solid fa-paper-plane" />
                        )}
                        <span>Post Reply</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-black/10 rounded-2xl border border-dashed border-white/5">
                    <p className="text-muted text-xs font-bold uppercase tracking-wider mb-4">Please log in to participate in the conversation</p>
                    <Link
                      to="/login"
                      className="bg-accent hover:bg-accent-hover text-black text-xs font-black uppercase tracking-wider py-3 px-6 rounded-xl transition-all"
                    >
                      Log In Account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* NEW DISCUSSION TOPIC CREATION MODAL SHEETS         */}
      {/* ═══════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blur backdrop */}
          <div
            onClick={() => setShowCreateModal(false)}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          />
          
          {/* Modal Container */}
          <div className="relative bg-[#1A1A1A] border border-gray-800/80 rounded-3xl w-full max-w-lg shadow-2xl p-6 md:p-8 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <i className="fa-solid fa-comments text-accent text-sm" />
                <span>Start New Discussion</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-xl bg-card border border-white/5 text-muted hover:text-accent flex items-center justify-center cursor-pointer transition-colors"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form onSubmit={handleCreateThread} className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted">Topic Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter a descriptive title..."
                  className="w-full bg-[#2A2A2A] border border-gray-700/50 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-500 mt-1.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted">Discussion Details</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Explain your topic details..."
                  className="w-full min-h-[160px] bg-[#2A2A2A] border border-gray-700/50 rounded-xl p-4 text-sm text-white placeholder-gray-500 mt-1.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-medium resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="border border-white/10 hover:border-accent text-muted hover:text-white text-xs font-black uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newTitle.trim() || !newContent.trim()}
                  className="bg-accent hover:bg-accent-hover disabled:bg-accent/30 disabled:text-black/50 text-black text-xs font-black uppercase tracking-wider py-3.5 px-6 rounded-xl flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <i className="fa-solid fa-plus" />
                  )}
                  <span>Create Topic</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

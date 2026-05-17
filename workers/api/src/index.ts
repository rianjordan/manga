/**
 * Reader's Haven — BFF API Proxy & D1 Database Worker
 *
 * Proxies all requests to MangaDex API with rate limiting and caching.
 * Intercepts custom user metadata routes (/users, /history, /follows, /collections)
 * and executes CRUD actions on Cloudflare D1 Database.
 */

const MANGADEX_API = 'https://api.mangadex.org'
const USER_AGENT = "Reader's Haven/1.0 (contact@readershaven.com)"

interface Env {
  MANGADEX_API_BASE?: string
  RATE_LIMIT?: string
  RATE_LIMIT_WINDOW?: string
  DB: D1Database // Bound to Cloudflare D1
}

interface RateLimitStore {
  tokens: number
  lastRefill: number
  maxTokens: number
  windowMs: number
}

// In-memory rate limiter for general proxy protection
const rateLimiters = new Map<string, RateLimitStore>()

function checkRateLimit(ip: string, maxTokens: number, windowMs: number): boolean {
  const now = Date.now()
  let limiter = rateLimiters.get(ip)

  if (!limiter) {
    limiter = { tokens: maxTokens, lastRefill: now, maxTokens, windowMs }
    rateLimiters.set(ip, limiter)
  }

  const elapsed = now - limiter.lastRefill
  const tokensToAdd = Math.floor(elapsed / limiter.windowMs) * limiter.maxTokens
  if (tokensToAdd > 0) {
    limiter.tokens = Math.min(limiter.maxTokens, limiter.tokens + tokensToAdd)
    limiter.lastRefill = now
  }

  if (limiter.tokens <= 0) return false

  limiter.tokens--
  return true
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
}

function getUserId(request: Request): string | null {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.substring(7).trim()
  return token || null // Storing user email as the mock session token / user identifier
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const clientIp = request.headers.get('CF-Connecting-IP') ?? 'unknown'
    const apiBase = env.MANGADEX_API_BASE ?? MANGADEX_API
    const maxTokens = parseInt(env.RATE_LIMIT ?? '4', 10)
    const windowMs = parseInt(env.RATE_LIMIT_WINDOW ?? '1000', 10)

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      })
    }

    // Strip optional '/api' prefix from pathname
    let path = url.pathname
    if (path.startsWith('/api')) {
      path = path.slice(4)
    }

    // ----------------------------------------------------
    // INTERCEPT D1 DATABASE ENDPOINTS
    // ----------------------------------------------------

    // 1. User Registration / Sync Profile
    if (path === '/users' && request.method === 'POST') {
      try {
        const { id, username, avatarUrl } = await request.json() as { id: string; username: string; avatarUrl?: string }
        if (!id || !username) {
          return new Response(JSON.stringify({ error: 'Missing user ID or username' }), { status: 400, headers: CORS_HEADERS })
        }

        await env.DB.prepare(
          `INSERT INTO users (id, username, avatar_url) VALUES (?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET username = excluded.username, avatar_url = excluded.avatar_url`
        ).bind(id, username, avatarUrl ?? null).run()

        return new Response(JSON.stringify({ success: true, user: { id, username, avatarUrl } }), { status: 200, headers: CORS_HEADERS })
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
      }
    }

    // 2. Reading History Endpoints
    if (path === '/history') {
      const userId = getUserId(request)
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS_HEADERS })
      }

      if (request.method === 'GET') {
        try {
          const { results } = await env.DB.prepare(
            `SELECT id, manga_id as mangaId, manga_title as mangaTitle, cover_file as coverFile,
                    chapter_id as chapterId, chapter_num as chapterNumber, page, read_at as readAt
             FROM reading_history WHERE user_id = ? ORDER BY read_at DESC LIMIT 50`
          ).bind(userId).all()

          return new Response(JSON.stringify({ data: results }), { status: 200, headers: CORS_HEADERS })
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
        }
      }

      if (request.method === 'POST') {
        try {
          const { mangaId, mangaTitle, coverFile, chapterId, chapterNumber, page } = await request.json() as any
          if (!mangaId || !chapterId) {
            return new Response(JSON.stringify({ error: 'Missing required parameters' }), { status: 400, headers: CORS_HEADERS })
          }

          await env.DB.prepare(
            `INSERT INTO reading_history (user_id, manga_id, manga_title, cover_file, chapter_id, chapter_num, page)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(user_id, chapter_id) DO UPDATE SET page = excluded.page, read_at = datetime('now')`
          ).bind(userId, mangaId, mangaTitle, coverFile ?? '', chapterId, chapterNumber ?? null, page ?? 1).run()

          return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS })
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
        }
      }
    }

    // 3. Follows / Bookmark Endpoints
    if (path === '/follows') {
      const userId = getUserId(request)
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS_HEADERS })
      }

      if (request.method === 'GET') {
        try {
          const { results } = await env.DB.prepare(
            `SELECT manga_id as mangaId, status, added_at as addedAt FROM follows WHERE user_id = ?`
          ).bind(userId).all()

          // Map results to a key-value record for ease of client-side lookup
          const followsMap: Record<string, any> = {}
          results.forEach((item: any) => {
            followsMap[item.mangaId] = item
          })

          return new Response(JSON.stringify({ data: followsMap }), { status: 200, headers: CORS_HEADERS })
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
        }
      }

      if (request.method === 'POST') {
        try {
          const { mangaId, status } = await request.json() as { mangaId: string; status: string }
          if (!mangaId || !status) {
            return new Response(JSON.stringify({ error: 'Missing mangaId or status' }), { status: 400, headers: CORS_HEADERS })
          }

          await env.DB.prepare(
            `INSERT INTO follows (user_id, manga_id, status) VALUES (?, ?, ?)
             ON CONFLICT(user_id, manga_id) DO UPDATE SET status = excluded.status, added_at = datetime('now')`
          ).bind(userId, mangaId, status).run()

          return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS })
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
        }
      }
    }

    if (path.startsWith('/follows/') && request.method === 'DELETE') {
      const userId = getUserId(request)
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS_HEADERS })
      }

      try {
        const mangaId = path.split('/')[2]
        if (!mangaId) {
          return new Response(JSON.stringify({ error: 'Missing manga ID' }), { status: 400, headers: CORS_HEADERS })
        }

        await env.DB.prepare(
          `DELETE FROM follows WHERE user_id = ? AND manga_id = ?`
        ).bind(userId, mangaId).run()

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS })
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
      }
    }

    // 4. Custom Lists & Collections Endpoints
    if (path === '/collections') {
      const userId = getUserId(request)
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS_HEADERS })
      }

      if (request.method === 'GET') {
        try {
          const { results } = await env.DB.prepare(
            `SELECT c.id, c.name, c.description, c.is_public as isPublic, c.created_at as createdAt,
                    COUNT(ci.manga_id) as itemsCount
             FROM collections c
             LEFT JOIN collection_items ci ON c.id = ci.collection_id
             WHERE c.user_id = ?
             GROUP BY c.id
             ORDER BY c.created_at DESC`
          ).bind(userId).all()

          return new Response(JSON.stringify({ data: results }), { status: 200, headers: CORS_HEADERS })
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
        }
      }

      if (request.method === 'POST') {
        try {
          const { name, description, isPublic } = await request.json() as { name: string; description?: string; isPublic?: boolean }
          if (!name) {
            return new Response(JSON.stringify({ error: 'Missing list name' }), { status: 400, headers: CORS_HEADERS })
          }

          const result = await env.DB.prepare(
            `INSERT INTO collections (user_id, name, description, is_public) VALUES (?, ?, ?, ?)`
          ).bind(userId, name, description ?? '', isPublic ? 1 : 0).run()

          return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), { status: 201, headers: CORS_HEADERS })
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
        }
      }
    }

    if (path.startsWith('/collections/')) {
      const userId = getUserId(request)
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS_HEADERS })
      }

      const parts = path.split('/') // "", "collections", ":id", ...
      const collectionId = parseInt(parts[2], 10)

      if (isNaN(collectionId)) {
        return new Response(JSON.stringify({ error: 'Invalid Collection ID' }), { status: 400, headers: CORS_HEADERS })
      }

      // Check ownership
      const collectionCheck = await env.DB.prepare(
        `SELECT id FROM collections WHERE id = ? AND user_id = ?`
      ).bind(collectionId, userId).first()

      if (!collectionCheck) {
        return new Response(JSON.stringify({ error: 'Collection not found or unauthorized' }), { status: 404, headers: CORS_HEADERS })
      }

      // GET /collections/:id - Get collection details + items list
      if (parts.length === 3 && request.method === 'GET') {
        try {
          const collection = await env.DB.prepare(
            `SELECT id, name, description, is_public as isPublic, created_at as createdAt FROM collections WHERE id = ?`
          ).bind(collectionId).first()

          const { results: items } = await env.DB.prepare(
            `SELECT manga_id as mangaId, position, added_at as addedAt FROM collection_items WHERE collection_id = ? ORDER BY position ASC`
          ).bind(collectionId).all()

          return new Response(JSON.stringify({ data: { ...collection, items } }), { status: 200, headers: CORS_HEADERS })
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
        }
      }

      // POST /collections/:id/items - Add manga item to list
      if (parts[3] === 'items' && request.method === 'POST') {
        try {
          const { mangaId, position } = await request.json() as { mangaId: string; position?: number }
          if (!mangaId) {
            return new Response(JSON.stringify({ error: 'Missing mangaId' }), { status: 400, headers: CORS_HEADERS })
          }

          await env.DB.prepare(
            `INSERT INTO collection_items (collection_id, manga_id, position) VALUES (?, ?, ?)
             ON CONFLICT(collection_id, manga_id) DO NOTHING`
          ).bind(collectionId, mangaId, position ?? 0).run()

          return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS })
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
        }
      }

      // DELETE /collections/:id/items/:mangaId - Remove manga item from list
      if (parts[3] === 'items' && parts[4] && request.method === 'DELETE') {
        try {
          const mangaId = parts[4]
          await env.DB.prepare(
            `DELETE FROM collection_items WHERE collection_id = ? AND manga_id = ?`
          ).bind(collectionId, mangaId).run()

          return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS })
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
        }
      }

      // DELETE /collections/:id - Delete full collection list
      if (parts.length === 3 && request.method === 'DELETE') {
        try {
          await env.DB.prepare(
            `DELETE FROM collections WHERE id = ?`
          ).bind(collectionId).run()

          return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS })
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
        }
      }
    }

    // 5. Views Count Endpoints
    if (path.startsWith('/manga/') && path.endsWith('/views') && request.method === 'POST') {
      try {
        const mangaId = path.split('/')[2]
        if (!mangaId) {
          return new Response(JSON.stringify({ error: 'Missing manga ID' }), { status: 400, headers: CORS_HEADERS })
        }

        await env.DB.prepare(
          `INSERT INTO manga_views (manga_id, views_count, last_viewed_at) VALUES (?, 1, datetime('now'))
           ON CONFLICT(manga_id) DO UPDATE SET views_count = views_count + 1, last_viewed_at = datetime('now')`
        ).bind(mangaId).run()

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS })
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
      }
    }

    // 6. Stats and Rating Aggregate Endpoint
    if (path.startsWith('/manga/') && path.endsWith('/stats') && request.method === 'GET') {
      try {
        const mangaId = path.split('/')[2]
        if (!mangaId) {
          return new Response(JSON.stringify({ error: 'Missing manga ID' }), { status: 400, headers: CORS_HEADERS })
        }

        // Get views
        const viewRow = await env.DB.prepare(
          `SELECT views_count FROM manga_views WHERE manga_id = ?`
        ).bind(mangaId).first() as { views_count: number } | null
        const views = viewRow?.views_count ?? 0

        // Get ratings avg & count
        const statsRow = await env.DB.prepare(
          `SELECT AVG(rating) as avgRating, COUNT(rating) as totalRatings FROM ratings WHERE manga_id = ?`
        ).bind(mangaId).first() as { avgRating: number | null; totalRatings: number } | null
        const averageRating = statsRow?.avgRating ? Math.round(statsRow.avgRating * 10) / 10 : 0
        const totalRatings = statsRow?.totalRatings ?? 0

        // Get user rating if logged in
        let userRating = 0
        const userId = getUserId(request)
        if (userId) {
          const userRatingRow = await env.DB.prepare(
            `SELECT rating FROM ratings WHERE user_id = ? AND manga_id = ?`
          ).bind(userId, mangaId).first() as { rating: number } | null
          userRating = userRatingRow?.rating ?? 0
        }

        return new Response(JSON.stringify({
          mangaId,
          views,
          averageRating,
          totalRatings,
          userRating
        }), { status: 200, headers: CORS_HEADERS })
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
      }
    }

    // 7. Rating Submission Endpoint
    if (path.startsWith('/manga/') && path.endsWith('/rating') && request.method === 'POST') {
      const userId = getUserId(request)
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS_HEADERS })
      }

      try {
        const mangaId = path.split('/')[2]
        const { rating } = await request.json() as { rating: number }
        if (!mangaId || !rating || rating < 1 || rating > 5) {
          return new Response(JSON.stringify({ error: 'Invalid mangaId or rating value' }), { status: 400, headers: CORS_HEADERS })
        }

        await env.DB.prepare(
          `INSERT INTO ratings (user_id, manga_id, rating) VALUES (?, ?, ?)
           ON CONFLICT(user_id, manga_id) DO UPDATE SET rating = excluded.rating, created_at = datetime('now')`
        ).bind(userId, mangaId, rating).run()

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS })
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
      }
    }

    // 8. Comments Endpoints (Manga and Chapter levels)
    if (path === '/comments') {
      if (request.method === 'GET') {
        try {
          const mangaId = url.searchParams.get('mangaId')
          const chapterId = url.searchParams.get('chapterId')

          if (!mangaId) {
            return new Response(JSON.stringify({ error: 'Missing mangaId parameter' }), { status: 400, headers: CORS_HEADERS })
          }

          let query = `
            SELECT c.id, c.content, c.created_at as createdAt, c.chapter_id as chapterId, c.user_id as userId,
                   u.username, u.avatar_url as avatarUrl
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.manga_id = ? AND `

          let params: any[] = [mangaId]
          if (chapterId) {
            query += `c.chapter_id = ?`
            params.push(chapterId)
          } else {
            query += `c.chapter_id IS NULL`
          }

          query += ` ORDER BY c.created_at DESC`

          const { results } = await env.DB.prepare(query).bind(...params).all()
          return new Response(JSON.stringify({ data: results }), { status: 200, headers: CORS_HEADERS })
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
        }
      }

      if (request.method === 'POST') {
        const userId = getUserId(request)
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS_HEADERS })
        }

        try {
          const { mangaId, chapterId, content } = await request.json() as { mangaId: string; chapterId?: string | null; content: string }
          if (!mangaId || !content?.trim()) {
            return new Response(JSON.stringify({ error: 'Missing required parameters' }), { status: 400, headers: CORS_HEADERS })
          }

          await env.DB.prepare(
            `INSERT INTO comments (user_id, manga_id, chapter_id, content) VALUES (?, ?, ?, ?)`
          ).bind(userId, mangaId, chapterId ?? null, content.trim()).run()

          return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS })
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
        }
      }
    }

    if (path.startsWith('/comments/') && request.method === 'DELETE') {
      const userId = getUserId(request)
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS_HEADERS })
      }

      try {
        const commentId = parseInt(path.split('/')[2], 10)
        if (isNaN(commentId)) {
          return new Response(JSON.stringify({ error: 'Invalid comment ID' }), { status: 400, headers: CORS_HEADERS })
        }

        // Verify ownership
        const comment = await env.DB.prepare(
          `SELECT user_id FROM comments WHERE id = ?`
        ).bind(commentId).first() as { user_id: string } | null

        if (!comment) {
          return new Response(JSON.stringify({ error: 'Comment not found' }), { status: 404, headers: CORS_HEADERS })
        }

        if (comment.user_id !== userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized to delete this comment' }), { status: 403, headers: CORS_HEADERS })
        }

        await env.DB.prepare(
          `DELETE FROM comments WHERE id = ?`
        ).bind(commentId).run()

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS })
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
      }
    }

    // 9. Forum Categories Endpoints
    if (path === '/forum/categories' && request.method === 'GET') {
      try {
        const { results } = await env.DB.prepare(`
          SELECT c.id, c.name, c.description,
                 COUNT(DISTINCT t.id) as threadsCount,
                 COUNT(DISTINCT p.id) as postsCount
          FROM forum_categories c
          LEFT JOIN forum_threads t ON c.id = t.category_id
          LEFT JOIN forum_posts p ON t.id = p.thread_id
          GROUP BY c.id
        `).all()

        return new Response(JSON.stringify({ data: results }), { status: 200, headers: CORS_HEADERS })
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
      }
    }

    // 10. Forum Threads Endpoints
    if (path === '/forum/threads') {
      if (request.method === 'GET') {
        try {
          const categoryId = url.searchParams.get('categoryId')
          if (!categoryId) {
            return new Response(JSON.stringify({ error: 'Missing categoryId parameter' }), { status: 400, headers: CORS_HEADERS })
          }

          const { results } = await env.DB.prepare(`
            SELECT t.id, t.title, t.content, t.views_count as viewsCount, t.created_at as createdAt, t.updated_at as updatedAt,
                   u.username, u.avatar_url as avatarUrl, t.user_id as userId,
                   COUNT(p.id) as repliesCount
            FROM forum_threads t
            JOIN users u ON t.user_id = u.id
            LEFT JOIN forum_posts p ON t.id = p.thread_id
            WHERE t.category_id = ?
            GROUP BY t.id
            ORDER BY t.updated_at DESC
          `).bind(categoryId).all()

          return new Response(JSON.stringify({ data: results }), { status: 200, headers: CORS_HEADERS })
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
        }
      }

      if (request.method === 'POST') {
        const userId = getUserId(request)
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS_HEADERS })
        }

        try {
          const { categoryId, title, content } = await request.json() as { categoryId: number; title: string; content: string }
          if (!categoryId || !title?.trim() || !content?.trim()) {
            return new Response(JSON.stringify({ error: 'Missing required parameters' }), { status: 400, headers: CORS_HEADERS })
          }

          const result = await env.DB.prepare(
            `INSERT INTO forum_threads (category_id, user_id, title, content) VALUES (?, ?, ?, ?)`
          ).bind(categoryId, userId, title.trim(), content.trim()).run()

          return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), { status: 201, headers: CORS_HEADERS })
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
        }
      }
    }

    if (path.startsWith('/forum/threads/')) {
      const parts = path.split('/')
      const threadId = parseInt(parts[3], 10)
      if (isNaN(threadId)) {
        return new Response(JSON.stringify({ error: 'Invalid thread ID' }), { status: 400, headers: CORS_HEADERS })
      }

      // GET /forum/threads/:id
      if (parts.length === 4 && request.method === 'GET') {
        try {
          // Increment views
          await env.DB.prepare(
            `UPDATE forum_threads SET views_count = views_count + 1 WHERE id = ?`
          ).bind(threadId).run()

          const thread = await env.DB.prepare(`
            SELECT t.id, t.title, t.content, t.views_count as viewsCount, t.created_at as createdAt, t.updated_at as updatedAt,
                   u.username, u.avatar_url as avatarUrl, t.user_id as userId, c.name as categoryName
            FROM forum_threads t
            JOIN users u ON t.user_id = u.id
            JOIN forum_categories c ON t.category_id = c.id
            WHERE t.id = ?
          `).bind(threadId).first()

          if (!thread) {
            return new Response(JSON.stringify({ error: 'Thread not found' }), { status: 404, headers: CORS_HEADERS })
          }

          return new Response(JSON.stringify({ data: thread }), { status: 200, headers: CORS_HEADERS })
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
        }
      }

      // DELETE /forum/threads/:id
      if (parts.length === 4 && request.method === 'DELETE') {
        const userId = getUserId(request)
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS_HEADERS })
        }

        try {
          const thread = await env.DB.prepare(
            `SELECT user_id FROM forum_threads WHERE id = ?`
          ).bind(threadId).first() as { user_id: string } | null

          if (!thread) {
            return new Response(JSON.stringify({ error: 'Thread not found' }), { status: 404, headers: CORS_HEADERS })
          }

          if (thread.user_id !== userId) {
            return new Response(JSON.stringify({ error: 'Unauthorized to delete this thread' }), { status: 403, headers: CORS_HEADERS })
          }

          await env.DB.prepare(`DELETE FROM forum_threads WHERE id = ?`).bind(threadId).run()
          return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS })
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
        }
      }

      // Posts inside thread: GET /forum/threads/:id/posts and POST /forum/threads/:id/posts
      if (parts[4] === 'posts') {
        if (request.method === 'GET') {
          try {
            const { results } = await env.DB.prepare(`
              SELECT p.id, p.content, p.created_at as createdAt,
                     u.username, u.avatar_url as avatarUrl, p.user_id as userId
              FROM forum_posts p
              JOIN users u ON p.user_id = u.id
              WHERE p.thread_id = ?
              ORDER BY p.created_at ASC
            `).bind(threadId).all()

            return new Response(JSON.stringify({ data: results }), { status: 200, headers: CORS_HEADERS })
          } catch (err: any) {
            return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
          }
        }

        if (request.method === 'POST') {
          const userId = getUserId(request)
          if (!userId) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS_HEADERS })
          }

          try {
            const { content } = await request.json() as { content: string }
            if (!content?.trim()) {
              return new Response(JSON.stringify({ error: 'Content is required' }), { status: 400, headers: CORS_HEADERS })
            }

            await env.DB.prepare(
              `INSERT INTO forum_posts (thread_id, user_id, content) VALUES (?, ?, ?)`
            ).bind(threadId, userId, content.trim()).run()

            // Update thread's updated_at
            await env.DB.prepare(
              `UPDATE forum_threads SET updated_at = datetime('now') WHERE id = ?`
            ).bind(threadId).run()

            return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS })
          } catch (err: any) {
            return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
          }
        }
      }
    }

    // 11. Forum Posts Deletion: DELETE /forum/posts/:id
    if (path.startsWith('/forum/posts/') && request.method === 'DELETE') {
      const userId = getUserId(request)
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS_HEADERS })
      }

      try {
        const postId = parseInt(path.split('/')[3], 10)
        if (isNaN(postId)) {
          return new Response(JSON.stringify({ error: 'Invalid post ID' }), { status: 400, headers: CORS_HEADERS })
        }

        const post = await env.DB.prepare(
          `SELECT user_id FROM forum_posts WHERE id = ?`
        ).bind(postId).first() as { user_id: string } | null

        if (!post) {
          return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404, headers: CORS_HEADERS })
        }

        if (post.user_id !== userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized to delete this reply' }), { status: 403, headers: CORS_HEADERS })
        }

        await env.DB.prepare(`DELETE FROM forum_posts WHERE id = ?`).bind(postId).run()
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: CORS_HEADERS })
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS_HEADERS })
      }
    }

    // ----------------------------------------------------
    // FALLBACK / PROXY ROUTE: Forward requests to MangaDex
    // ----------------------------------------------------

    // In-memory rate limiting check for proxy traffic
    if (!checkRateLimit(clientIp, maxTokens, windowMs)) {
      return new Response(
        JSON.stringify({
          errors: [{ detail: 'Rate limit exceeded. Please slow down your requests.' }],
        }),
        {
          status: 429,
          headers: {
            ...CORS_HEADERS,
            'Retry-After': '1',
            'X-RateLimit-Limit': String(maxTokens),
          },
        },
      )
    }

    // Build upstream MangaDex API URL using our stripped pathname
    const upstreamUrl = `${apiBase}${path}${url.search}`

    // Build the request parameters safely - only forward safe standard headers
    const fetchHeaders = new Headers()
    fetchHeaders.set('User-Agent', USER_AGENT)

    const allowedHeaders = ['accept', 'accept-language', 'content-type']
    for (const [key, value] of request.headers.entries()) {
      if (allowedHeaders.includes(key.toLowerCase())) {
        fetchHeaders.set(key, value)
      }
    }

    const fetchOptions: RequestInit = {
      method: request.method,
      headers: fetchHeaders,
      redirect: 'follow',
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const bodyBuffer = await request.arrayBuffer()
      if (bodyBuffer.byteLength > 0) {
        fetchOptions.body = bodyBuffer
      }
    }

    // Establish TTL caches for MangaDex endpoints
    let cacheTtl = 0
    if (path.startsWith('/cover') || path.startsWith('/manga') && !request.method?.toLowerCase().includes('post')) {
      cacheTtl = 300 // 5 min for static manga data
    }
    if (path.startsWith('/chapter') && !path.includes('/feed') && !path.includes('/server')) {
      cacheTtl = 300 // 5 min for single chapters
    }
    if (path.startsWith('/manga') && path.includes('/feed')) {
      cacheTtl = 30 // 30s for feeds
    }

    // Look up cached response
    if (cacheTtl > 0 && request.method === 'GET') {
      const cache = caches.default
      const cacheKey = new Request(upstreamUrl, {
        method: 'GET',
        headers: fetchHeaders,
      })
      const cached = await cache.match(cacheKey)
      if (cached) {
        const response = new Response(cached.body, cached)
        Object.entries(CORS_HEADERS).forEach(([key, val]) => response.headers.set(key, val))
        response.headers.set('X-Cache', 'HIT')
        return response
      }
    }

    try {
      const response = await fetch(upstreamUrl, fetchOptions)
      const requestId = response.headers.get('X-Request-ID')
      if (!response.ok && requestId) {
        console.error(`MangaDex error: ${response.status} for ${path}, Request-ID: ${requestId}`)
      }

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') ?? '2'
        return new Response(
          JSON.stringify({
            errors: [{ detail: 'MangaDex API rate limit reached. Please retry later.' }],
          }),
          {
            status: 429,
            headers: {
              ...CORS_HEADERS,
              'Retry-After': retryAfter,
            },
          },
        )
      }

      const responseBody = await response.arrayBuffer()
      const newResponse = new Response(responseBody, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          ...CORS_HEADERS,
          'X-Proxy': 'readers-haven',
        },
      })

      // Put in Cache
      if (cacheTtl > 0 && response.ok && request.method === 'GET') {
        const cache = caches.default
        const cacheKey = new Request(upstreamUrl, {
          method: 'GET',
          headers: fetchHeaders,
        })
        const cachedResponse = new Response(responseBody, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(newResponse.headers.entries()),
            'Cache-Control': `public, max-age=${cacheTtl}`,
          },
        })
        await cache.put(cacheKey, cachedResponse)
      }

      return newResponse
    } catch (err: any) {
      console.error(`Upstream proxy request failed for ${path}:`, err)
      return new Response(
        JSON.stringify({
          errors: [{ detail: 'Failed to connect to MangaDex API.' }],
        }),
        {
          status: 502,
          headers: CORS_HEADERS,
        },
      )
    }
  },
}

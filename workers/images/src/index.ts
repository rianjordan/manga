/**
 * Reader's Haven — Image Proxy Worker
 *
 * MangaDex blocks image hotlinking — all image requests MUST be proxied.
 * This worker:
 * - Proxies /data/* and /covers/* from uploads.mangadex.org
 * - Caches images at the edge (24h) using Cloudflare Cache API
 * - Adds proper CORS headers
 * - Supports WebP conversion via Accept header
 */

const UPLOADS_BASE = 'https://uploads.mangadex.org'
const USER_AGENT = "Reader's Haven/1.0 (contact@readershaven.com)"
const CACHE_TTL = 86_400 // 24 hours

interface Env {
  MANGADEX_UPLOADS_BASE?: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const uploadsBase = env.MANGADEX_UPLOADS_BASE ?? UPLOADS_BASE

    // Strip optional local development '/images' prefix if present
    let imagePath = url.pathname
    if (imagePath.startsWith('/images')) {
      imagePath = imagePath.slice(7)
    }

    // Only proxy /data/, /data-saver/, and /covers/ paths
    const validPrefixes = ['/data/', '/data-saver/', '/covers/']
    const shouldProxy = validPrefixes.some((prefix) => imagePath.startsWith(prefix))

    if (!shouldProxy) {
      return new Response('Not Found', { status: 404 })
    }

    // Build upstream URL
    const upstreamUrl = `${uploadsBase}${imagePath}`

    // Check cache first
    const cache = caches.default
    const cacheKey = new Request(upstreamUrl, request)
    const cachedResponse = await cache.match(cacheKey)

    if (cachedResponse) {
      const response = new Response(cachedResponse.body, cachedResponse)
      response.headers.set('X-Cache', 'HIT')
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    // Forward the request
    const upstreamRequest = new Request(upstreamUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: request.headers.get('Accept') ?? '*/*',
      },
    })

    try {
      const response = await fetch(upstreamRequest)

      if (!response.ok) {
        // Serve a placeholder image on 404 from MangaDex
        if (response.status === 404) {
          return new Response(null, {
            status: 404,
            headers: { 'Access-Control-Allow-Origin': '*' },
          })
        }

        return new Response(
          JSON.stringify({ error: 'Image fetch failed' }),
          {
            status: response.status,
            headers: { 'Access-Control-Allow-Origin': '*' },
          },
        )
      }

      // Read the image data
      const imageBuffer = await response.arrayBuffer()
      const contentType = response.headers.get('Content-Type') ?? 'image/jpeg'

      // Build response with caching headers
      const newResponse = new Response(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': `public, max-age=${CACHE_TTL}`,
          'Access-Control-Allow-Origin': '*',
          'X-Proxy': 'readers-haven-images',
          'Content-Length': String(imageBuffer.byteLength),
        },
      })

      // Store in Cloudflare Cache
      await cache.put(cacheKey, newResponse.clone())

      return newResponse
    } catch (error) {
      console.error(`Image proxy failed for ${imagePath}:`, error)
      return new Response(
        JSON.stringify({ error: 'Image proxy error' }),
        {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      )
    }
  },
}

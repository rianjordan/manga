import { RateLimiter } from './rate-limiter'

const BASE_URL = (import.meta.env.VITE_API_BASE as string) || '/api'
const IMAGE_BASE = (import.meta.env.VITE_IMAGE_BASE as string) || '/images'

const limiter = new RateLimiter(4, 1000)

interface FetchOptions extends RequestInit {
  retries?: number
}

export class ApiError extends Error {
  status: number
  requestId?: string

  constructor(status: number, message: string, requestId?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.requestId = requestId
  }
}

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { retries = 2, ...fetchOptions } = options

  for (let attempt = 0; attempt <= retries; attempt++) {
    await limiter.wait()

    try {
      let token: string | null = null
      try {
        const authData = localStorage.getItem('rh-auth')
        if (authData) {
          token = JSON.parse(authData).state?.sessionToken ?? null
        }
      } catch (e) {}

      const headers = new Headers(fetchOptions.headers)
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
      }

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      const url = `${BASE_URL}${path}`
      const res = await fetch(url, {
        ...fetchOptions,
        headers,
      })

      const requestId = res.headers.get('X-Request-ID') ?? undefined

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') ?? '2', 10)
        await new Promise((r) => setTimeout(r, retryAfter * 1000))
        continue
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new ApiError(
          res.status,
          body.errors?.[0]?.detail ?? res.statusText,
          requestId,
        )
      }

      return (await res.json()) as T
    } catch (error) {
      if (error instanceof ApiError) throw error
      if (attempt === retries) throw error
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt))
    }
  }

  throw new Error('Request failed after retries')
}

export function imageUrl(path: string): string {
  return `${IMAGE_BASE}/${path}`
}

export const api = {
  get: <T>(path: string, params?: Record<string, unknown>) => {
    const searchParams = new URLSearchParams()
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, String(v)))
        } else if (value !== null && typeof value === 'object') {
          for (const [subKey, subVal] of Object.entries(value)) {
            if (subVal !== undefined && subVal !== null) {
              searchParams.append(`${key}[${subKey}]`, String(subVal))
            }
          }
        } else if (value !== undefined && value !== null) {
          searchParams.set(key, String(value))
        }
      }
    }
    const query = searchParams.toString()
    return request<T>(query ? `${path}?${query}` : path)
  },
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
}

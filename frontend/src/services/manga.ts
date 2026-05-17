import { api, imageUrl } from '../lib/api'
import type {
  MangaListResponse,
  MangaResponse,
  ChapterListResponse,
  ChapterPages,
  SearchParams,
  CoverArt,
  MangaStatistics,
} from '../lib/types'

export function coverUrl(mangaId: string, fileName: string): string {
  return imageUrl(`covers/${mangaId}/${fileName}.512.jpg`)
}

export const mangaService = {
  search: (params: SearchParams) => {
    const query: Record<string, unknown> = {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
      includes: ['cover_art', 'author', 'artist'],
    }

    if (params.ids) query['ids[]'] = params.ids
    if (params.title) query.title = params.title
    if (params.status) query.status = params.status
    if (params.includedTags) query['includedTags[]'] = params.includedTags
    if (params.excludedTags) query['excludedTags[]'] = params.excludedTags
    if (params.contentRating) query['contentRating[]'] = params.contentRating
    if (params.order) query.order = params.order
    if (params.hasAvailableChapters !== undefined) query.hasAvailableChapters = params.hasAvailableChapters
    if (params.translatedLanguage) query['translatedLanguage[]'] = params.translatedLanguage
    if (params.originalLanguage) query['originalLanguage[]'] = params.originalLanguage

    return api.get<MangaListResponse>('/manga', query)
  },

  getById: (id: string) =>
    api.get<MangaResponse>(`/manga/${id}`, {
      includes: ['cover_art', 'author', 'artist', 'tag'],
    }),

  getFeed: (id: string, params: { limit?: number; offset?: number; translatedLanguage?: string[]; order?: Record<string, string> }) => {
    const query: Record<string, unknown> = {
      limit: params.limit ?? 100,
      offset: params.offset ?? 0,
      includes: ['scanlation_group', 'user'],
      order: params.order ?? { volume: 'desc', chapter: 'desc' },
    }
    if (params.translatedLanguage) {
      query['translatedLanguage[]'] = params.translatedLanguage
    }
    return api.get<ChapterListResponse>(`/manga/${id}/feed`, query)
  },

  getCover: (id: string) =>
    api.get<{ data: CoverArt[] }>('/cover', {
      'manga[]': [id],
      limit: 1,
      order: { volume: 'desc' },
    }),

  getRandom: () =>
    api.get<MangaResponse>('/manga/random', {
      includes: ['cover_art', 'author', 'artist'],
      contentRating: ['safe', 'suggestive'],
    }),

  getTags: () =>
    api.get<{ data: import('../lib/types').Tag[] }>('/manga/tag'),

  getCovers: (mangaId: string) =>
    api.get<{ data: CoverArt[] }>('/cover', {
      'manga[]': [mangaId],
      limit: 100,
      order: { volume: 'asc' },
    }),

  // Fetch MangaDex statistics: rating (average & Bayesian), follows, etc.
  getStatistics: async (mangaId: string): Promise<MangaStatistics | null> => {
    try {
      const response = await api.get<{ statistics: Record<string, MangaStatistics> }>(
        `/statistics/manga/${mangaId}`
      )
      return response.statistics?.[mangaId] ?? null
    } catch (err) {
      console.error('Failed to fetch manga statistics:', err)
      return null
    }
  },
}

export const chapterService = {
  getById: (id: string) =>
    api.get<{ data: import('../lib/types').Chapter }>(`/chapter/${id}`, {
      includes: ['scanlation_group', 'manga'],
    }),

  getPages: (id: string) =>
    api.get<ChapterPages>(`/at-home/server/${id}`),
}

export const coverService = {
  getFileName: async (mangaId: string): Promise<string | null> => {
    const res = await mangaService.getCover(mangaId)
    return res.data?.[0]?.attributes?.fileName ?? null
  },
}

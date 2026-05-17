export interface Manga {
  id: string
  type: string
  attributes: {
    title: Record<string, string>
    altTitles: Record<string, string>[]
    description: Record<string, string>
    status: string
    year: number | null
    contentRating: string
    tags: Tag[]
    latestChapter: string | null
    updatedAt: string
  }
  relationships: Relationship[]
}

export interface Tag {
  id: string
  attributes: {
    name: Record<string, string>
    group: string
  }
}

export interface Relationship {
  id: string
  type: string
  attributes?: Record<string, unknown>
  related?: string
}

export interface Chapter {
  id: string
  type: string
  attributes: {
    volume: string | null
    chapter: string | null
    title: string | null
    translatedLanguage: string
    pages: number
    publishAt: string
    updatedAt: string
  }
  relationships: Relationship[]
}

export interface ChapterPages {
  baseUrl: string
  chapter: {
    hash: string
    data: string[]
    dataSaver: string[]
  }
}

export interface CoverArt {
  id: string
  attributes: {
    fileName: string
    volume: string | null
  }
}

export interface MangaResponse {
  data: Manga
  relationships?: Record<string, unknown>
}

export interface MangaListResponse {
  data: Manga[]
  total: number
  limit: number
  offset: number
}

export interface ChapterListResponse {
  data: Chapter[]
  total: number
  limit: number
  offset: number
}

export interface MangaStatistics {
  rating: {
    average: number | null
    bayesian: number
  }
  follows: number
  comments: number | null
  rating6MonthsAverage: number | null
}

export interface SearchParams {
  ids?: string[]
  title?: string
  limit?: number
  offset?: number
  status?: string[]
  includedTags?: string[]
  excludedTags?: string[]
  contentRating?: string[]
  order?: Record<string, string>
  hasAvailableChapters?: boolean
  translatedLanguage?: string[]
  originalLanguage?: string[]
}

export type MangaStatus = 'reading' | 'completed' | 'plan_to_read' | 'dropped' | 'on_hold'

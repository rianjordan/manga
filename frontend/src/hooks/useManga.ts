import { useQuery } from '@tanstack/react-query'
import { mangaService, chapterService, coverService } from '../services/manga'
import type { SearchParams } from '../lib/types'

export function useMangaSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['manga-search', params],
    queryFn: () => mangaService.search(params),
    staleTime: 60_000,
  })
}

export function useManga(id: string) {
  return useQuery({
    queryKey: ['manga', id],
    queryFn: () => mangaService.getById(id),
    staleTime: 300_000,
  })
}

export function useMangaFeed(
  id: string,
  params?: { limit?: number; offset?: number; translatedLanguage?: string[] },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['manga-feed', id, params],
    queryFn: () => mangaService.getFeed(id, params ?? {}),
    staleTime: 30_000,
    enabled: options?.enabled,
  })
}

export function useChapter(id: string) {
  return useQuery({
    queryKey: ['chapter', id],
    queryFn: () => chapterService.getById(id),
    staleTime: 300_000,
  })
}

export function useChapterPages(id: string) {
  return useQuery({
    queryKey: ['chapter-pages', id],
    queryFn: () => chapterService.getPages(id),
    staleTime: 300_000,
  })
}

export function useCoverFile(mangaId: string) {
  return useQuery({
    queryKey: ['cover', mangaId],
    queryFn: () => coverService.getFileName(mangaId),
    staleTime: 3600_000,
  })
}

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

export function useRandomManga() {
  return useQuery({
    queryKey: ['manga-random'],
    queryFn: () => mangaService.getRandom(),
    enabled: false, // Only fetch on demand
    staleTime: 0,
  })
}

export function useTags() {
  return useQuery({
    queryKey: ['manga-tags'],
    queryFn: () => mangaService.getTags(),
    staleTime: 3600_000, // Cache for 1 hour
  })
}

export function useMangaCovers(mangaId: string) {
  return useQuery({
    queryKey: ['manga-covers', mangaId],
    queryFn: () => mangaService.getCovers(mangaId),
    staleTime: 600_000,
  })
}

import { create } from "zustand";
import type { MediaItem, FilterState, FaceData } from "@/types/media";

interface MemorialState {
  // Media state
  media: MediaItem[];
  filteredMedia: MediaItem[];
  activeId: string | null;
  hoveredId: string | null;
  
  // UI state
  isModalOpen: boolean;
  isFilterPanelOpen: boolean;
  isLoading: boolean;
  
  // Filter state
  filters: FilterState;
  
  // Known faces from AI processing
  knownFaces: Array<{ id: string; name?: string; thumbnail?: string; count: number }>;
  
  // Life chapters
  chapters: string[];
  
  // Actions
  setMedia: (media: MediaItem[]) => void;
  setActiveId: (id: string | null) => void;
  setHoveredId: (id: string | null) => void;
  setModalOpen: (open: boolean) => void;
  setFilterPanelOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  setKnownFaces: (faces: MemorialState['knownFaces']) => void;
  setChapters: (chapters: string[]) => void;
  addMemoryToMedia: (mediaId: string, memory: import('@/types/media').Memory) => void;
  updateMediaItem: (mediaId: string, updates: Partial<MediaItem>) => void;
  
  // Computed
  getActiveMedia: () => MediaItem | undefined;
}

export const useMemorialStore = create<MemorialState>((set, get) => ({
  media: [],
  filteredMedia: [],
  activeId: null,
  hoveredId: null,
  isModalOpen: false,
  isFilterPanelOpen: false,
  isLoading: false,
  filters: {},
  knownFaces: [],
  chapters: [],
  
  setMedia: (media) => {
    const { filters } = get();
    const filteredMedia = applyFilters(media, filters);
    set({ media, filteredMedia });
  },
  
  setActiveId: (id) => set({ activeId: id, isModalOpen: id !== null }),
  
  setHoveredId: (id) => set({ hoveredId: id }),
  
  setModalOpen: (open) => set({ isModalOpen: open, activeId: open ? get().activeId : null }),
  
  setFilterPanelOpen: (open) => set({ isFilterPanelOpen: open }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setFilters: (newFilters) => {
    const filters = { ...get().filters, ...newFilters };
    const filteredMedia = applyFilters(get().media, filters);
    set({ filters, filteredMedia });
  },
  
  clearFilters: () => {
    set({ filters: {}, filteredMedia: get().media });
  },
  
  setKnownFaces: (knownFaces) => set({ knownFaces }),
  
  setChapters: (chapters) => set({ chapters }),
  
  addMemoryToMedia: (mediaId, memory) => {
    const { media, filters } = get();
    const updatedMedia = media.map(item => {
      if (item.id === mediaId) {
        return {
          ...item,
          memories: [...(item.memories || []), memory],
        };
      }
      return item;
    });
    const filteredMedia = applyFilters(updatedMedia, filters);
    set({ media: updatedMedia, filteredMedia });
  },
  
  updateMediaItem: (mediaId, updates) => {
    const { media, filters } = get();
    const updatedMedia = media.map(item => {
      if (item.id === mediaId) {
        return { ...item, ...updates };
      }
      return item;
    });
    const filteredMedia = applyFilters(updatedMedia, filters);
    set({ media: updatedMedia, filteredMedia });
  },
  
  getActiveMedia: () => {
    const { media, activeId } = get();
    return media.find(m => m.id === activeId);
  },
}));

function applyFilters(media: MediaItem[], filters: FilterState): MediaItem[] {
  return media.filter(item => {
    if (filters.faceId && !item.faces?.some(f => f.id === filters.faceId)) {
      return false;
    }
    if (filters.chapter && item.chapter !== filters.chapter) {
      return false;
    }
    if (filters.visibility && item.visibility !== filters.visibility) {
      return false;
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = item.title?.toLowerCase().includes(searchLower);
      const matchesTags = item.tags?.some(t => t.toLowerCase().includes(searchLower));
      if (!matchesTitle && !matchesTags) {
        return false;
      }
    }
    return true;
  });
}

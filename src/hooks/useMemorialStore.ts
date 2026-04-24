import { create } from "zustand";

interface MediaItem {
  id: string;
  url?: string;
  title?: string;
  type: "image" | "video" | "document";
  visibility: "public" | "family" | "admin";
}

interface MemorialState {
  media: MediaItem[];
  activeId: string | null;
  setMedia: (media: MediaItem[]) => void;
  setActiveId: (id: string | null) => void;
}

export const useMemorialStore = create<MemorialState>((set) => ({
  media: [],
  activeId: null,
  setMedia: (media) => set({ media }),
  setActiveId: (id) => set({ activeId: id }),
}));

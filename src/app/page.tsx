"use client";

import dynamic from "next/dynamic";
import { NavigationHUD } from "@/components/memorial-wall/NavigationHUD";
import { MediaDetailModal } from "@/components/memorial-wall/MediaDetailModal";
import { useMemorialStore } from "@/hooks/useMemorialStore";

// Dynamic import for the 3D component to avoid SSR issues
const MemorialWall3D = dynamic(
  () => import("@/components/memorial-wall/MemorialWall3D"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading memorial...</p>
        </div>
      </div>
    )
  }
);

export default function Home() {
  const { getActiveMedia } = useMemorialStore();
  const activeMedia = getActiveMedia();

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#0a0a1a]">
      {/* 3D Wall */}
      <MemorialWall3D />
      
      {/* Navigation overlay */}
      <NavigationHUD />
      
      {/* Media detail modal */}
      <MediaDetailModal media={activeMedia} />
    </main>
  );
}

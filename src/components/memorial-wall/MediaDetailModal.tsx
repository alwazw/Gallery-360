"use client";

import React, { useEffect, useCallback } from "react";
import { useMemorialStore } from "@/hooks/useMemorialStore";
import { X, Share2, MessageCircle, Download, ChevronLeft, ChevronRight, Play, FileText, User, Calendar, MapPin, Tag } from "lucide-react";
import type { MediaItem } from "@/types/media";

interface MediaDetailModalProps {
  media: MediaItem | undefined;
}

function MediaContent({ media }: { media: MediaItem }) {
  if (media.type === 'video') {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-black/50 rounded-lg">
        {media.url ? (
          <video 
            src={media.url} 
            controls 
            className="max-w-full max-h-full rounded-lg"
            poster=""
          />
        ) : (
          <div className="flex flex-col items-center gap-4 text-slate-400">
            <Play className="w-16 h-16" />
            <span>Video preview unavailable</span>
          </div>
        )}
      </div>
    );
  }

  if (media.type === 'document') {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-slate-900/50 rounded-lg">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <FileText className="w-16 h-16" />
          <span className="text-lg">{media.title || media.name}</span>
          <a 
            href={media.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Open Document
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {media.url ? (
        <img 
          src={media.url} 
          alt={media.title || 'Memorial photo'} 
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
      ) : (
        <div className="w-full h-64 bg-slate-800/50 rounded-lg flex items-center justify-center">
          <span className="text-slate-500">Image not available</span>
        </div>
      )}
    </div>
  );
}

function MetadataSection({ media }: { media: MediaItem }) {
  return (
    <div className="space-y-4">
      {/* AI-detected faces */}
      {media.faces && media.faces.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
            <User className="w-4 h-4" />
            People in this photo
          </h4>
          <div className="flex flex-wrap gap-2">
            {media.faces.map((face) => (
              <span 
                key={face.id}
                className={`px-3 py-1 rounded-full text-sm ${
                  face.isDeceased 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'bg-slate-700/50 text-slate-300'
                }`}
              >
                {face.name || 'Unknown'}
                {face.isDeceased && ' (Deceased)'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Date taken */}
      {media.dateTaken && (
        <div className="flex items-center gap-2 text-slate-400">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{media.dateTaken}</span>
        </div>
      )}

      {/* Location */}
      {media.location && (
        <div className="flex items-center gap-2 text-slate-400">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{media.location}</span>
        </div>
      )}

      {/* Life chapter */}
      {media.chapter && (
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-indigo-400" />
          <span className="text-sm text-indigo-300">{media.chapter}</span>
        </div>
      )}

      {/* Tags */}
      {media.tags && media.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {media.tags.map((tag, i) => (
            <span 
              key={i}
              className="px-2 py-1 bg-slate-700/30 text-slate-400 rounded text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function MemoriesSection({ media }: { media: MediaItem }) {
  if (!media.memories || media.memories.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">No memories shared yet</p>
        <button className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors">
          Add a Memory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {media.memories.map((memory) => (
        <div key={memory.id} className="bg-slate-800/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <span className="text-sm font-medium text-slate-200">{memory.authorName}</span>
              <span className="text-xs text-slate-500 ml-2">{memory.createdAt}</span>
            </div>
          </div>
          {memory.type === 'text' ? (
            <p className="text-slate-300 text-sm leading-relaxed">{memory.content}</p>
          ) : (
            <audio src={memory.content} controls className="w-full mt-2" />
          )}
        </div>
      ))}
    </div>
  );
}

export function MediaDetailModal({ media }: MediaDetailModalProps) {
  const { isModalOpen, setModalOpen, setActiveId, filteredMedia, activeId } = useMemorialStore();

  const currentIndex = filteredMedia.findIndex(m => m.id === activeId);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < filteredMedia.length - 1;

  const goToPrev = useCallback(() => {
    if (canGoPrev) {
      setActiveId(filteredMedia[currentIndex - 1].id);
    }
  }, [canGoPrev, currentIndex, filteredMedia, setActiveId]);

  const goToNext = useCallback(() => {
    if (canGoNext) {
      setActiveId(filteredMedia[currentIndex + 1].id);
    }
  }, [canGoNext, currentIndex, filteredMedia, setActiveId]);

  const handleClose = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, goToPrev, goToNext, handleClose]);

  if (!isModalOpen || !media) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
      
      {/* Modal content */}
      <div 
        className="relative w-full max-w-6xl max-h-[90vh] mx-4 flex gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation - Previous */}
        <button
          onClick={goToPrev}
          disabled={!canGoPrev}
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 z-10 p-3 rounded-full transition-all ${
            canGoPrev 
              ? 'bg-white/10 hover:bg-white/20 text-white cursor-pointer' 
              : 'bg-white/5 text-white/30 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Main content area */}
        <div className="flex-1 bg-slate-900/95 rounded-2xl overflow-hidden flex flex-col lg:flex-row">
          {/* Media display */}
          <div className="flex-1 p-6 flex items-center justify-center min-h-[400px] bg-black/30">
            <MediaContent media={media} />
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 bg-slate-900 border-l border-slate-800 flex flex-col max-h-[90vh] lg:max-h-none overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white truncate pr-4">
                {media.title || media.name || 'Untitled'}
              </h3>
              <button 
                onClick={handleClose}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Actions */}
            <div className="p-4 border-b border-slate-800 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm">
                <Download className="w-4 h-4" />
                Save
              </button>
            </div>

            {/* Metadata */}
            <div className="p-4 border-b border-slate-800">
              <MetadataSection media={media} />
            </div>

            {/* Memories / Stories */}
            <div className="flex-1 p-4">
              <h4 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Shared Memories
              </h4>
              <MemoriesSection media={media} />
            </div>

            {/* Visibility indicator */}
            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className={`w-2 h-2 rounded-full ${
                  media.visibility === 'public' ? 'bg-green-500' :
                  media.visibility === 'family' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
                <span className="capitalize">{media.visibility} visibility</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation - Next */}
        <button
          onClick={goToNext}
          disabled={!canGoNext}
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 z-10 p-3 rounded-full transition-all ${
            canGoNext 
              ? 'bg-white/10 hover:bg-white/20 text-white cursor-pointer' 
              : 'bg-white/5 text-white/30 cursor-not-allowed'
          }`}
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from 'react';
import { useMemorialStore } from './useMemorialStore';
import type { MediaItem } from '@/types/media';

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  currentItem: string | null;
  error: string | null;
}

export function useAIProcessing() {
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    currentItem: null,
    error: null,
  });

  const { setMedia, setKnownFaces, setChapters, media } = useMemorialStore();

  const processAllMedia = useCallback(async () => {
    if (media.length === 0) {
      setState(prev => ({ ...prev, error: 'No media to process' }));
      return;
    }

    setState({
      isProcessing: true,
      progress: 0,
      currentItem: 'Initializing...',
      error: null,
    });

    try {
      const response = await fetch('/api/ai/process-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaItems: media }),
      });

      if (!response.ok) {
        throw new Error('Failed to process media');
      }

      const data = await response.json();

      if (data.success) {
        // Update store with processed data
        setMedia(data.processedItems);
        setKnownFaces(data.knownFaces);
        setChapters(data.chapters);

        setState({
          isProcessing: false,
          progress: 100,
          currentItem: null,
          error: null,
        });

        return data.stats;
      } else {
        throw new Error(data.error || 'Processing failed');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
      return null;
    }
  }, [media, setMedia, setKnownFaces, setChapters]);

  const processSingleItem = useCallback(async (item: MediaItem) => {
    if (!item.url) return null;

    try {
      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: item.url,
          fileName: item.name || item.id,
          operations: ['faces', 'metadata', 'moderation'],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process item');
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error processing item:', error);
      return null;
    }
  }, []);

  return {
    ...state,
    processAllMedia,
    processSingleItem,
  };
}

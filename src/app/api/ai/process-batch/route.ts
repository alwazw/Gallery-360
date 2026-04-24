import { NextResponse } from 'next/server';
import { 
  processMediaBatch,
  groupFaces,
  extractChapters
} from '@/lib/ai/metadata-extractor';
import type { MediaItem } from '@/types/media';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mediaItems } = body as { mediaItems: MediaItem[] };

    if (!mediaItems || !Array.isArray(mediaItems)) {
      return NextResponse.json(
        { error: 'Media items array is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Process all media items with AI
    const processedItems = await processMediaBatch(mediaItems);
    
    // Group detected faces across all items
    const knownFaces = groupFaces(processedItems);
    
    // Extract unique life chapters
    const chapters = extractChapters(processedItems);

    return NextResponse.json({
      success: true,
      processedItems,
      knownFaces,
      chapters,
      stats: {
        totalItems: mediaItems.length,
        itemsWithFaces: processedItems.filter(i => i.faces && i.faces.length > 0).length,
        uniqueFaces: knownFaces.length,
        chapters: chapters.length,
        totalProcessingTime: Date.now() - startTime,
      }
    });
  } catch (error) {
    console.error('Batch processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process media batch' },
      { status: 500 }
    );
  }
}

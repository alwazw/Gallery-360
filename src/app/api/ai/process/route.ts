import { NextResponse } from 'next/server';
import { 
  detectFaces, 
  extractMetadata, 
  moderateContent 
} from '@/lib/ai/metadata-extractor';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, fileName, operations = ['faces', 'metadata'] } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    const results: Record<string, any> = {};
    const startTime = Date.now();

    // Run requested operations in parallel
    const promises: Promise<void>[] = [];

    if (operations.includes('faces')) {
      promises.push(
        detectFaces(imageUrl).then(result => {
          results.faces = result;
        })
      );
    }

    if (operations.includes('metadata')) {
      promises.push(
        extractMetadata(imageUrl, fileName || 'unknown').then(result => {
          results.metadata = result;
        })
      );
    }

    if (operations.includes('moderation')) {
      promises.push(
        moderateContent(imageUrl).then(result => {
          results.moderation = result;
        })
      );
    }

    await Promise.all(promises);

    return NextResponse.json({
      success: true,
      results,
      totalProcessingTime: Date.now() - startTime,
    });
  } catch (error) {
    console.error('AI processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}

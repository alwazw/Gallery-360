import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Supported file extensions by type
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
const DOCUMENT_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt', '.rtf', '.odt'];

function getFileType(ext: string): 'image' | 'video' | 'document' {
  const normalizedExt = ext.toLowerCase();
  if (IMAGE_EXTENSIONS.includes(normalizedExt)) return 'image';
  if (VIDEO_EXTENSIONS.includes(normalizedExt)) return 'video';
  if (DOCUMENT_EXTENSIONS.includes(normalizedExt)) return 'document';
  return 'document'; // Default to document for unknown types
}

function isMediaFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS, ...DOCUMENT_EXTENSIONS].includes(ext);
}

export async function GET() {
  try {
    const mediaDir = path.join(os.homedir(), 'temp', 'media');

    // Create directory if it doesn't exist (for development convenience)
    if (!fs.existsSync(mediaDir)) {
      try {
        fs.mkdirSync(mediaDir, { recursive: true });
        console.log(`Created media directory: ${mediaDir}`);
      } catch (mkdirError) {
        console.log(`Could not create media directory: ${mediaDir}`);
      }
      return NextResponse.json({ 
        files: [],
        message: `Media directory created at ${mediaDir}. Add files to see them in the gallery.`
      });
    }

    const files = fs.readdirSync(mediaDir);
    const mediaFiles = files
      .filter(file => {
        // Filter out hidden files and non-media files
        if (file.startsWith('.')) return false;
        return isMediaFile(file);
      })
      .map((file, index) => {
        const ext = path.extname(file).toLowerCase();
        const type = getFileType(ext);
        const stats = fs.statSync(path.join(mediaDir, file));

        return {
          id: `local-${index}-${file.replace(/[^a-zA-Z0-9]/g, '-')}`,
          name: file,
          title: path.basename(file, ext).replace(/[-_]/g, ' '),
          type,
          url: `/api/local-media/serve?file=${encodeURIComponent(file)}`,
          size: stats.size,
          modified: stats.mtime.toISOString(),
          visibility: 'public' as const,
        };
      })
      .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());

    return NextResponse.json({ 
      files: mediaFiles,
      directory: mediaDir,
      count: mediaFiles.length
    });
  } catch (error) {
    console.error('Error reading local media:', error);
    return NextResponse.json({ 
      error: 'Failed to read local media',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

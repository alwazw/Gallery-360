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

function scanDirectory(dir: string, prefix: string, usePublicPath: boolean = false): Array<{
  id: string;
  name: string;
  title: string;
  type: 'image' | 'video' | 'document';
  url: string;
  size: number;
  modified: string;
  visibility: 'public';
}> {
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir);
  return files
    .filter(file => {
      if (file.startsWith('.')) return false;
      return isMediaFile(file);
    })
    .map((file, index) => {
      const ext = path.extname(file).toLowerCase();
      const type = getFileType(ext);
      const stats = fs.statSync(path.join(dir, file));

      return {
        id: `${prefix}-${index}-${file.replace(/[^a-zA-Z0-9]/g, '-')}`,
        name: file,
        title: path.basename(file, ext).replace(/[-_]/g, ' '),
        type,
        url: usePublicPath 
          ? `/test-media/${encodeURIComponent(file)}`
          : `/api/local-media/serve?file=${encodeURIComponent(file)}`,
        size: stats.size,
        modified: stats.mtime.toISOString(),
        visibility: 'public' as const,
      };
    });
}

export async function GET() {
  try {
    // Primary: ~/temp/media directory
    const localMediaDir = path.join(os.homedir(), 'temp', 'media');
    
    // Fallback: public/test-media directory (bundled test assets)
    const testMediaDir = path.join(process.cwd(), 'public', 'test-media');

    // Create local directory if it doesn't exist
    if (!fs.existsSync(localMediaDir)) {
      try {
        fs.mkdirSync(localMediaDir, { recursive: true });
        console.log(`Created media directory: ${localMediaDir}`);
      } catch (mkdirError) {
        console.log(`Could not create media directory: ${localMediaDir}`);
      }
    }

    // Scan both directories
    const localFiles = scanDirectory(localMediaDir, 'local', false);
    const testFiles = scanDirectory(testMediaDir, 'test', true);

    // Combine and sort by modified date
    const allFiles = [...localFiles, ...testFiles]
      .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());

    return NextResponse.json({ 
      files: allFiles,
      directories: {
        local: localMediaDir,
        test: testMediaDir
      },
      counts: {
        local: localFiles.length,
        test: testFiles.length,
        total: allFiles.length
      }
    });
  } catch (error) {
    console.error('Error reading local media:', error);
    return NextResponse.json({ 
      error: 'Failed to read local media',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

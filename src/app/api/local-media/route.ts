import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function GET() {
  try {
    const mediaDir = path.join(os.homedir(), 'temp', 'media');

    if (!fs.existsSync(mediaDir)) {
      return NextResponse.json({ files: [] });
    }

    const files = fs.readdirSync(mediaDir);
    const mediaFiles = files.map(file => {
      const ext = path.extname(file).toLowerCase();
      let type: 'image' | 'video' | 'document' = 'image';

      if (['.mp4', '.webm', '.ogg'].includes(ext)) {
        type = 'video';
      } else if (['.pdf', '.docx', '.txt'].includes(ext)) {
        type = 'document';
      }

      return {
        id: file,
        name: file,
        type,
        url: `/api/local-media/serve?file=${encodeURIComponent(file)}`
      };
    });

    return NextResponse.json({ files: mediaFiles });
  } catch (error) {
    console.error('Error reading local media:', error);
    return NextResponse.json({ error: 'Failed to read local media' }, { status: 500 });
  }
}

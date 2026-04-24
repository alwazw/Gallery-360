/**
 * AI Metadata Extraction Service
 * 
 * This module provides interfaces and mock implementations for AI-powered
 * metadata extraction. In production, this would connect to:
 * - Immich API for self-hosted face recognition
 * - AWS Rekognition for content moderation and face detection
 * 
 * For local development, we use simulated data to demonstrate the UI.
 */

import type { FaceData, MediaItem } from "@/types/media";

// Simulated face detection result
export interface FaceDetectionResult {
  faces: FaceData[];
  processingTime: number;
}

// Content moderation result
export interface ModerationResult {
  isAppropriate: boolean;
  flags: Array<{
    type: 'violence' | 'adult' | 'offensive' | 'spam';
    confidence: number;
  }>;
  processingTime: number;
}

// Metadata extraction result
export interface MetadataResult {
  dateTaken?: string;
  location?: string;
  camera?: string;
  tags: string[];
  suggestedChapter?: string;
}

// Life chapter definitions
const LIFE_CHAPTERS = [
  "Early Years",
  "School Days",
  "College Years",
  "Military Service",
  "Wedding & Marriage",
  "Career Highlights",
  "Family Moments",
  "Travels & Adventures",
  "Hobbies & Passions",
  "Golden Years",
  "Celebrations",
];

// Simulated faces for demo
const SIMULATED_FACES: Array<{ id: string; name: string; isDeceased?: boolean }> = [
  { id: "face-1", name: "John Smith", isDeceased: true },
  { id: "face-2", name: "Mary Smith" },
  { id: "face-3", name: "Robert Smith" },
  { id: "face-4", name: "Sarah Johnson" },
  { id: "face-5", name: "Unknown" },
];

// Simulated tags
const SIMULATED_TAGS = [
  ["family", "gathering", "holiday"],
  ["outdoor", "nature", "hiking"],
  ["celebration", "party", "birthday"],
  ["portrait", "formal"],
  ["travel", "vacation"],
  ["wedding", "ceremony"],
  ["graduation", "achievement"],
  ["sports", "recreation"],
  ["home", "domestic"],
  ["work", "professional"],
];

/**
 * Simulates face detection on an image
 * In production, this would call Immich API or AWS Rekognition
 */
export async function detectFaces(imageUrl: string): Promise<FaceDetectionResult> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  // Generate random number of faces (0-3)
  const numFaces = Math.floor(Math.random() * 4);
  const faces: FaceData[] = [];
  
  for (let i = 0; i < numFaces; i++) {
    const faceTemplate = SIMULATED_FACES[Math.floor(Math.random() * SIMULATED_FACES.length)];
    faces.push({
      id: `${faceTemplate.id}-${Date.now()}-${i}`,
      name: faceTemplate.name,
      boundingBox: {
        x: 0.2 + Math.random() * 0.3,
        y: 0.1 + Math.random() * 0.2,
        width: 0.15 + Math.random() * 0.1,
        height: 0.2 + Math.random() * 0.1,
      },
      confidence: 0.7 + Math.random() * 0.3,
      isDeceased: faceTemplate.isDeceased,
    });
  }
  
  return {
    faces,
    processingTime: 500 + Math.random() * 1000,
  };
}

/**
 * Simulates content moderation check
 * In production, this would call AWS Rekognition Content Moderation
 */
export async function moderateContent(imageUrl: string): Promise<ModerationResult> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
  
  // 98% of content passes moderation in simulation
  const isAppropriate = Math.random() > 0.02;
  
  return {
    isAppropriate,
    flags: isAppropriate ? [] : [
      {
        type: 'adult' as const,
        confidence: 0.6 + Math.random() * 0.3,
      }
    ],
    processingTime: 300 + Math.random() * 500,
  };
}

/**
 * Extracts metadata from media file
 * In production, this would use EXIF data and AI tagging
 */
export async function extractMetadata(mediaUrl: string, fileName: string): Promise<MetadataResult> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
  
  // Generate simulated metadata
  const randomTags = SIMULATED_TAGS[Math.floor(Math.random() * SIMULATED_TAGS.length)];
  const randomChapter = LIFE_CHAPTERS[Math.floor(Math.random() * LIFE_CHAPTERS.length)];
  
  // Generate random date in past 50 years
  const yearsAgo = Math.floor(Math.random() * 50);
  const randomDate = new Date();
  randomDate.setFullYear(randomDate.getFullYear() - yearsAgo);
  randomDate.setMonth(Math.floor(Math.random() * 12));
  randomDate.setDate(Math.floor(Math.random() * 28) + 1);
  
  const locations = [
    "New York, NY",
    "Los Angeles, CA",
    "Chicago, IL",
    "Houston, TX",
    "Miami, FL",
    "Seattle, WA",
    "Denver, CO",
    "Boston, MA",
    undefined, // Some images don't have location
  ];
  
  return {
    dateTaken: randomDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    location: locations[Math.floor(Math.random() * locations.length)],
    tags: randomTags,
    suggestedChapter: randomChapter,
  };
}

/**
 * Process a batch of media items with AI
 */
export async function processMediaBatch(
  mediaItems: MediaItem[],
  onProgress?: (processed: number, total: number) => void
): Promise<MediaItem[]> {
  const results: MediaItem[] = [];
  
  for (let i = 0; i < mediaItems.length; i++) {
    const item = mediaItems[i];
    
    if (item.type === 'image' && item.url) {
      // Process images with face detection and metadata extraction
      const [faceResult, metadata] = await Promise.all([
        detectFaces(item.url),
        extractMetadata(item.url, item.name || item.id),
      ]);
      
      results.push({
        ...item,
        faces: faceResult.faces,
        tags: metadata.tags,
        dateTaken: metadata.dateTaken,
        location: metadata.location,
        chapter: metadata.suggestedChapter,
      });
    } else {
      // Non-image items get basic metadata only
      const metadata = await extractMetadata(item.url || '', item.name || item.id);
      results.push({
        ...item,
        tags: metadata.tags,
        chapter: metadata.suggestedChapter,
      });
    }
    
    onProgress?.(i + 1, mediaItems.length);
  }
  
  return results;
}

/**
 * Group faces across all media to identify unique people
 */
export function groupFaces(mediaItems: MediaItem[]): Array<{
  id: string;
  name?: string;
  thumbnail?: string;
  count: number;
  isDeceased?: boolean;
}> {
  const faceMap = new Map<string, {
    name?: string;
    count: number;
    isDeceased?: boolean;
    firstUrl?: string;
  }>();
  
  for (const item of mediaItems) {
    if (!item.faces) continue;
    
    for (const face of item.faces) {
      // Use name as grouping key (in production, would use face embeddings)
      const key = face.name || face.id;
      const existing = faceMap.get(key);
      
      if (existing) {
        existing.count++;
      } else {
        faceMap.set(key, {
          name: face.name,
          count: 1,
          isDeceased: face.isDeceased,
          firstUrl: item.url,
        });
      }
    }
  }
  
  return Array.from(faceMap.entries())
    .map(([id, data]) => ({
      id,
      name: data.name,
      count: data.count,
      isDeceased: data.isDeceased,
      thumbnail: data.firstUrl,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Extract unique chapters from processed media
 */
export function extractChapters(mediaItems: MediaItem[]): string[] {
  const chapters = new Set<string>();
  
  for (const item of mediaItems) {
    if (item.chapter) {
      chapters.add(item.chapter);
    }
  }
  
  // Sort chapters by their position in LIFE_CHAPTERS
  return Array.from(chapters).sort((a, b) => {
    const indexA = LIFE_CHAPTERS.indexOf(a);
    const indexB = LIFE_CHAPTERS.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
}

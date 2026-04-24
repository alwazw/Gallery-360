export interface MediaItem {
  id: string;
  url?: string;
  title?: string;
  name?: string;
  type: 'image' | 'video' | 'document';
  visibility: 'public' | 'family' | 'admin';
  // AI metadata
  faces?: FaceData[];
  tags?: string[];
  dateTaken?: string;
  location?: string;
  chapter?: string; // e.g., "The Military Years", "College Days"
  // Story tagging
  memories?: Memory[];
}

export interface FaceData {
  id: string;
  name?: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  isDeceased?: boolean;
}

export interface Memory {
  id: string;
  type: 'text' | 'voice';
  content: string; // text or audio URL
  authorName: string;
  createdAt: string;
}

export interface FilterState {
  faceId?: string;
  chapter?: string;
  visibility?: 'public' | 'family' | 'admin';
  search?: string;
}

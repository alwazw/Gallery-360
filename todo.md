# Project Roadmap & Progress

## Phase 1: Foundation
- [x] Initialize Next.js project with Three.js/R3F dependencies.
- [/] Configure Supabase RLS policies for tiered media visibility. (Planned for production)
- [x] Set up local testing bridge for `~/temp/media` directory.

## Phase 2: The 3D Wall UI
- [x] Implement infinite curved grid geometry.
- [x] Add kinetic scrolling and hover-tilting effects.
- [x] Integrate placeholder and local media fetching.
- [x] Enhanced 3D visuals with premium lighting, particles, and animations.
- [x] Interactive MediaCard with hover glow, scale, and click-to-open.
- [x] Media detail modal with keyboard navigation (left/right arrows, escape).
- [x] Navigation HUD with search, filters, and share functionality.
- [x] Filter panel for visibility, faces, and life chapters.

## Phase 3: AI & Moderation
- [x] AI metadata extraction service (simulated for local dev).
- [x] Face detection and grouping logic.
- [x] Life chapter extraction from metadata.
- [x] AI Panel UI for processing and browsing results.
- [x] Batch processing API for media items.
- [ ] Connect Immich API for production facial recognition.
- [ ] Integrate AWS Rekognition for content moderation (paid scrub feature).

## Phase 4: Social & Engagement
- [ ] Implement "Story Tagging" for text/voice attachments.
- [ ] Build the voice note recording and playback UI.
- [ ] Create the "One-Click Share" invite tool with link generation.
- [ ] Contribution portal for family/friends uploads.

## Phase 5: Production Readiness
- [ ] Set up Supabase tables and RLS policies.
- [ ] Implement real authentication with Supabase Auth.
- [ ] Admin moderation queue and dashboard.
- [ ] Event curation mode for physical services.
- [ ] Performance optimization and lazy loading.

---

## Recent Changes (Latest Session)

### UI Enhancements Completed:
1. **Enhanced 3D Wall** - Premium visuals with stars, floating particles, animated grid background
2. **Improved Lighting** - Multi-source lighting (key, fill, rim) for cinematic effect
3. **MediaCard Upgrades** - Rounded corners, glow effects, type badges, smooth animations
4. **Media Detail Modal** - Full-featured modal with image/video/doc support, metadata display, memory section
5. **Navigation HUD** - Search bar, filter panel, share button, active filter pills
6. **AI Discovery Panel** - Face grouping, life chapters, batch processing trigger

### AI Integration Completed:
1. **Metadata Extractor Service** - Face detection, content moderation, tag extraction (simulated)
2. **Batch Processing API** - Process all media items with progress tracking
3. **Face Grouping** - Identify unique faces across all media
4. **Life Chapters** - Automatic categorization into life periods
5. **AI Processing Hook** - React hook for triggering AI analysis from UI

### Files Created/Modified:
- `src/types/media.ts` - TypeScript interfaces for media, faces, memories
- `src/hooks/useMemorialStore.ts` - Enhanced Zustand store with filters, faces, chapters
- `src/hooks/useAIProcessing.ts` - AI processing hook
- `src/lib/ai/metadata-extractor.ts` - AI service with simulated processing
- `src/components/memorial-wall/MemorialWall3D.tsx` - Enhanced 3D scene
- `src/components/memorial-wall/MediaCard.tsx` - Premium card component
- `src/components/memorial-wall/MediaDetailModal.tsx` - Modal for viewing media
- `src/components/memorial-wall/NavigationHUD.tsx` - Top navigation with filters
- `src/components/memorial-wall/AIPanel.tsx` - AI discovery sidebar
- `src/app/api/ai/process/route.ts` - Single item AI processing
- `src/app/api/ai/process-batch/route.ts` - Batch AI processing
- `src/app/api/local-media/route.ts` - Enhanced local media listing
- `src/app/api/local-media/serve/route.ts` - Enhanced file serving

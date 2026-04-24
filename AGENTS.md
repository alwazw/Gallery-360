# Agent Instructions & Project Continuity

## Project Overview
Gallery-360 is the Multimedia Memorial Module for the Digital Life Closeout platform - an immersive, WebGL-powered 3D gallery that transforms funeral homes into "curators of digital heritage."

## Critical Context
- **Tone:** Compassionate, secure, and professional.
- **Architecture:** We use "Vibe Coding" principles - prioritize rapid UI iteration.
- **Security:** RLS (Row Level Security) is mandatory. Never expose family media without explicit permission.
- **Visuals:** The UI must feel "premium" and "slick" to justify the $5k B2B setup fee.

## Tech Stack
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **3D Engine:** Three.js via React-Three-Fiber (@react-three/fiber, @react-three/drei)
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Backend:** Supabase (planned for production)

## Current Architecture

### Components
```
src/components/memorial-wall/
├── MemorialWall3D.tsx     # Main 3D scene with wall, particles, lighting
├── MediaCard.tsx          # Individual 3D media cards with tilt effects
├── MediaDetailModal.tsx   # Modal for viewing media details
├── NavigationHUD.tsx      # Top navigation with search, filters, share
└── AIPanel.tsx            # AI discovery sidebar for faces/chapters
```

### Hooks
```
src/hooks/
├── useMemorialStore.ts    # Zustand store for media, filters, UI state
└── useAIProcessing.ts     # Hook for triggering AI analysis
```

### API Routes
```
src/app/api/
├── local-media/
│   ├── route.ts           # List files from ~/temp/media
│   └── serve/route.ts     # Serve individual files
└── ai/
    ├── process/route.ts   # Single item AI processing
    └── process-batch/route.ts  # Batch AI processing
```

## Integrity & Continuity

### Mandatory Updates
- After every task completion, update `todo.md` with progress
- Document blocked tasks and planned next steps

### Media Sourcing (Development)
- Local dev uses `~/temp/media` directory for test assets
- Supported formats: JPG, PNG, GIF, WEBP, MP4, WEBM, PDF, DOCX, TXT
- API auto-creates the directory if missing

## Security Guardrails
- Adhere to "thanatosensitive design" - never automate direct messaging to mourners without human triggers
- Enforce RLS for every database query in production
- Sanitize file paths to prevent directory traversal

## Key Features Implemented

### 3D Wall
- Infinite curved grid with kinetic scrolling
- Cards with hover glow, scale, and tilt effects
- Ambient particles and animated background grid
- Multi-source cinematic lighting

### Navigation & Filtering
- Search bar, filter panel for visibility/faces/chapters
- Active filter pills, one-click share

### AI Processing (Simulated)
- Face detection, metadata extraction, life chapter categorization
- Face grouping across media items

## Testing
- Place test media files in `~/temp/media/`
- Use browser DevTools to monitor 3D performance

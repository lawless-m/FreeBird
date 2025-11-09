# FreeBird - Personal Work & Idea Tracker

## Overview
FreeBird is a personal knowledge base PWA that captures work completed, ideas, and outcomes across multiple creative and professional domains. It consolidates what would typically be split across Trello (todos), OneNote (ideas/notes), and manual CV updates into a single system.

## Core Purpose
- **Capture work as it happens** to prevent forgetting accomplishments
- **Record ideas** before they're lost
- **Track outcomes and impact** of completed work
- **Generate resumes/portfolios** from accumulated entries
- **Surface connections** between projects over time

## Technology Stack
- **Frontend/Backend**: Next.js (React + API routes)
- **Database**: MongoDB (schemaless for flexibility)
- **Hosting**: Self-hosted on Linux VM
- **Storage**: Local filesystem for images/files
- **PWA**: Service workers, offline capability, mobile-friendly

## Data Model

### Entry Types
All entries share common structure but have type-specific fields:

#### Common Fields (all entries)
```javascript
{
  _id: ObjectId,
  type: "idea" | "work" | "outcome" | "job" | "education",
  title: String,
  content: String, // Markdown/rich text
  date: Date,
  category: String, // "software", "ceramics", "3dprinting", "aquatics", etc
  tags: [String],
  images: [String], // file paths
  relatedTo: [ObjectId], // links to other entries
  createdAt: Date,
  updatedAt: Date
}
```

#### Type: Idea
- Status: "new" | "in-progress" | "completed" | "abandoned"
- Notes field for unstructured thoughts

#### Type: Work
- What was done
- Tools/technologies/materials used
- Time invested (optional)

#### Type: Outcome
- Impact/results
- What was learned
- What would be done differently
- Links back to related work entries

#### Type: Job
- Company name
- Job title
- Start date / end date
- STAR entries (Situation, Task, Action, Result)
- Skills developed
- Key achievements

#### Type: Education
- Institution
- Qualification
- Dates
- Notable projects/achievements

## Key Features

### MVP (Phase 1)
1. **Entry Creation**
   - Simple form for adding entries
   - Photo upload (store in `/public/uploads`)
   - Category/tag selection
   - Type selection (idea/work/outcome)

2. **Views**
   - Timeline view (all entries chronologically)
   - Category view (filter by domain)
   - Ideas board (Trello-style view of ideas)
   - Work log (completed work)

3. **Basic Resume Generation**
   - Pull job/education entries
   - Format into traditional CV sections
   - Export as PDF or HTML

### Phase 2 (AI Enhancement - Later)
1. **Voice Transcription** (separate tool - see below)
2. **Auto-categorization** from images using local vision models
3. **Connection surfacing** - "This is similar to project X from 6 months ago"
4. **Impact tracking** - Group related entries, measure outcomes
5. **Smart resume generation** - Claude API to write professional descriptions from raw entries

## UI/UX Considerations
- Mobile-first (quick capture on phone)
- Fast entry creation (minimize friction)
- Good search/filter capabilities
- Offline support for viewing and drafting entries
- Clean, distraction-free interface

## Deployment
- Single Next.js application
- MongoDB running on same VM or separate container
- Standard Node.js deployment (`npm run build && npm start`)
- Nginx/Caddy reverse proxy (optional)
- No Docker required for MVP

## Future Enhancements
- Multi-user support (teams could use this)
- Public portfolio URLs (share selected entries)
- Integration with git repos (auto-log commits/PRs)
- Analytics dashboard (productivity insights)
- Export formats (Markdown, JSON, PDF)

## Notes for Claude Code Implementation
- Use TypeScript for type safety despite MongoDB being schemaless
- Implement proper image optimization (next/image)
- Consider using next-pwa package for PWA functionality
- MongoDB connection with mongoose for easier schema definition
- Implement proper error handling for image uploads
- Add data validation middleware
- Consider rate limiting for API routes
- Implement proper authentication (even if single user initially)

---

**Project Name Etymology**: FreeBird - capturing your accomplishments and ideas so they can fly freely rather than being forgotten. Also suggests freedom from scattered tools (Trello, OneNote, manual CV updates).

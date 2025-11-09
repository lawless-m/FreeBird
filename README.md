# FreeBird - Personal Knowledge Base

FreeBird is a Progressive Web App (PWA) that consolidates work tracking, idea management, and resume generation into a single, powerful personal knowledge base.

## Features

### Core Features (MVP)
- **Entry Management**: Create, view, and organize entries across multiple types (ideas, work, outcomes, jobs, education)
- **Timeline View**: Chronological view of all your entries
- **Ideas Board**: Trello-style kanban board for managing ideas by status
- **Work Log**: Track completed work and outcomes
- **Category Filter**: Organize entries by domain (software, ceramics, 3D printing, etc.)
- **Resume Generation**: Automatically generate a professional CV from job and education entries
- **Image Upload**: Attach photos to entries with automatic optimization
- **PWA Support**: Install on mobile devices for offline access
- **Mobile-First Design**: Optimized for quick capture on phones

### Phase 2 Features (AI-Enhanced)
- **Full-Text Search**: Fast search across all entries with live dropdown results
- **Export Data**: Download entries in JSON or Markdown format with filters
- **AI-Powered Related Entries**: Automatically discover connections between entries using Claude AI
- **Smart Resume Enhancement**: Generate professional descriptions for job/education entries using Claude AI

## Tech Stack

- **Frontend/Backend**: Next.js 16 with TypeScript
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS v4
- **Image Processing**: Sharp
- **PWA**: next-pwa
- **AI**: Anthropic Claude API (Claude 3.5 Sonnet)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or remote)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd FreeBird
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```bash
MONGODB_URI=mongodb://localhost:27017/freebird
ANTHROPIC_API_KEY=sk-ant-your-key-here  # Optional: for AI features
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Production Deployment

**📖 See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete production deployment guide.**

The deployment guide covers:
- Linux VM setup
- MongoDB installation and security
- PM2 process management
- Nginx reverse proxy configuration
- SSL/HTTPS with Let's Encrypt
- Automated backups
- Performance optimization
- Troubleshooting

### Quick Deploy

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

For production environments, use PM2 for process management (see deployment guide).

## Project Structure

```
FreeBird/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes
│   │   ├── categories/   # Category view
│   │   ├── entry/        # Entry creation/editing
│   │   ├── ideas/        # Ideas board
│   │   ├── resume/       # Resume generator
│   │   ├── timeline/     # Timeline view
│   │   └── work/         # Work log
│   ├── components/       # Reusable React components
│   ├── lib/              # Utility functions (DB connection)
│   ├── models/           # Mongoose models
│   └── types/            # TypeScript type definitions
├── public/
│   └── uploads/          # User-uploaded images
└── .env.local            # Environment variables (not committed)
```

## API Endpoints

### Core Endpoints
- `GET /api/entries` - List all entries (supports ?type, ?category, ?tag filters)
- `POST /api/entries` - Create a new entry
- `GET /api/entries/[id]` - Get a specific entry
- `PUT /api/entries/[id]` - Update an entry
- `DELETE /api/entries/[id]` - Delete an entry
- `POST /api/upload` - Upload and optimize images

### Phase 2 Endpoints
- `GET /api/search?q={query}` - Full-text search across all entries
- `GET /api/export?format={json|markdown}&type={type}&category={category}` - Export entries
- `POST /api/ai/find-related` - Find related entries using AI (requires ANTHROPIC_API_KEY)
- `POST /api/ai/enhance-resume` - Generate professional descriptions using AI (requires ANTHROPIC_API_KEY)

## External Integration

The API can be used by external apps for enhanced functionality:
- **Voice Transcription App** - Separate standalone app for voice-to-text entry creation that posts to FreeBird via the API
- Other quick-capture tools and mobile apps can POST entries via the API endpoints

## Future Enhancements

Phase 2 features planned:
- Auto-categorization using local vision models
- Connection surfacing between related projects
- Smart resume generation using Claude API
- Multi-user support
- Public portfolio URLs
- Git integration for automatic commit tracking

## License

ISC

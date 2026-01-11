# LearnInsight

AI-Powered Learning Progress & Insight Platform

## Overview

LearnInsight is a full-featured learning analytics system where students can track progress, the system detects weak areas, and AI recommends personalized YouTube videos + study content.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, TypeScript, TailwindCSS 4 |
| Animations | Framer Motion, Lottie, Lenis |
| State | Redux Toolkit (Phase 1C) |
| Backend | Express 5, Node.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + HTTP-only cookies |
| AI | Gemini API (Phase 3) |

## Project Structure

```
LearnInsight/
├── frontend/                 # Next.js 16 App
│   ├── src/
│   │   ├── app/              # App router pages
│   │   ├── components/       # React components
│   │   └── providers/        # Context providers
│   └── package.json
│
├── backend/                  # Express API (COMPLETE)
│   ├── src/
│   │   ├── config/           # Configuration & DB
│   │   ├── controllers/      # 8 controllers
│   │   ├── middleware/       # Auth, error, validation
│   │   ├── models/           # 7 Mongoose models
│   │   ├── routes/           # 8 route files
│   │   ├── validators/       # Input validation
│   │   ├── services/         # AI services (Phase 3)
│   │   └── utils/            # Helpers
│   └── package.json
│
├── .husky/                   # Git hooks
├── package.json              # Root scripts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account

### Installation

```bash
git clone <repo-url>
cd LearnInsight

npm install                    # Root dependencies
cd frontend && npm install     # Frontend dependencies
cd ../backend && npm install   # Backend dependencies
```

### Environment Setup

```bash
cp backend/.env.example backend/.env
```

Update `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/learninsight
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
FRONTEND_URL=http://localhost:3000
```

### Running

```bash
npm run dev              # Both frontend + backend
npm run dev:frontend     # Frontend only (port 3000)
npm run dev:backend      # Backend only (port 5000)
```

## Progress Tracker

### Phase 1: Foundation

#### Phase 1A: Backend Models - COMPLETED
- [x] User, Subject, Quiz, QuizAttempt, Progress, Insight, Syllabus

#### Phase 1B: Auth Routes - COMPLETED
- [x] Register, Login, Logout, Me, Update Profile, Change Password

#### Phase 1C: Frontend Auth - PENDING
- [ ] Redux store setup
- [ ] Login/Register pages
- [ ] Protected routes

### Phase 2: Core Backend - COMPLETED

#### Users
- [x] Get all users (admin)
- [x] Get/Update/Delete user
- [x] Enroll/Unenroll in subjects

#### Subjects
- [x] CRUD operations
- [x] Hierarchical structure (parent-child)
- [x] Resource management (YouTube, articles, PDFs)

#### Quizzes
- [x] CRUD operations
- [x] Publish/Unpublish
- [x] Duplicate quiz

#### Quiz Attempts
- [x] Submit attempts with auto-scoring
- [x] Get stats and history
- [x] Leaderboard

#### Progress
- [x] Track per subject
- [x] Quiz stats aggregation
- [x] Resource view tracking
- [x] Student progress view (teacher/admin)

#### Insights
- [x] Generate insights (weak areas, strengths)
- [x] Recommendations system
- [x] AI summary (placeholder)

#### Syllabus
- [x] Upload syllabus content
- [x] Generate quiz from syllabus (placeholder for AI)
- [x] Extract topics (placeholder for AI)

### Phase 3: AI Integration - PENDING
- [ ] Gemini API integration
- [ ] AI quiz generation
- [ ] AI topic extraction
- [ ] YouTube API search
- [ ] Smart recommendations

### Phase 4: Frontend Development - PENDING
- [ ] Student dashboard
- [ ] Teacher dashboard
- [ ] Admin panel
- [ ] Charts (Recharts)

### Phase 5: Polish & Deploy - PENDING
- [ ] UI polish
- [ ] CI/CD
- [ ] Deployment

## API Endpoints Summary

| Resource | Endpoints | Auth |
|----------|-----------|------|
| Auth | 6 | Public/Private |
| Users | 7 | Admin/Teacher |
| Subjects | 8 | Private |
| Quizzes | 8 | Private |
| Attempts | 6 | Private |
| Progress | 7 | Private |
| Insights | 5 | Private |
| Syllabus | 7 | Private |

**Total: 54 API endpoints**

See `backend/README.md` for complete API documentation.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run frontend + backend |
| `npm run dev:frontend` | Frontend only |
| `npm run dev:backend` | Backend only |
| `npm run build` | Build frontend |
| `npm run lint` | Run ESLint |

## License

ISC

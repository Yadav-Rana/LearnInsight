# LearnInsight

AI-powered learning analytics platform with per-teacher classrooms.

## Overview

LearnInsight is a multi-tenant learning system where teachers run their own classrooms and students see personalised insights driven by Gemini and YouTube. Teachers invite students via a short code; each teacher's subjects and quizzes are private by default, while a shared public library (seeded CSE content) is visible to everyone.

What the AI actually does:
- Reads a teacher-uploaded syllabus (PDF / DOCX / TXT) and turns it into multiple-choice quizzes.
- Extracts a structured topic / subtopic outline from a syllabus.
- Writes a short narrative summary of a student's weak areas and recommends YouTube videos for them, with thumbnails resolved via the YouTube Data API.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (Turbopack), React 19, TypeScript, TailwindCSS 4 |
| Animation / scroll | Framer Motion, Lenis |
| State | Redux Toolkit |
| Charts | Recharts |
| Backend | Express 5, Node.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT in HTTP-only cookies (Bearer header also accepted) |
| AI | Google Gemini (`@google/genai`) — `gemini-2.5-flash` + `gemini-2.5-pro` |
| External | YouTube Data API v3 |
| Document extraction | `pdf-parse` (PDF), `mammoth` (DOCX), plain UTF-8 (TXT) |
| File upload | `multer` (in-memory, 10 MB cap) |

## Project Structure

```
LearnInsight/
├── frontend/                            # Next.js 16 app
│   ├── public/
│   │   └── sw.js                        # Self-unregistering service worker shim
│   └── src/
│       ├── app/
│       │   ├── (auth)/                  # Login, Register
│       │   ├── (dashboard)/             # Protected app shell
│       │   │   ├── dashboard/           # Student + Teacher dashboards
│       │   │   ├── subjects/            # List + detail (with Find Videos modal)
│       │   │   ├── quizzes/             # List, create, edit, attempt
│       │   │   ├── syllabus/            # Upload (PDF/DOCX/TXT) + topics panel
│       │   │   ├── insights/            # AI-generated insights
│       │   │   ├── progress/            # Per-subject progress
│       │   │   └── students/            # Teacher: roster + per-student detail
│       │   └── (marketing)/             # Landing, about, contact
│       ├── components/
│       │   ├── auth/                    # ProtectedRoute
│       │   ├── dashboard/               # StatsCard, ChartCard, ClassroomCard,
│       │   │                            #  JoinTeacherBanner, WelcomeBanner, ...
│       │   ├── landing/                 # Hero, features, etc.
│       │   └── ui/                      # Button, Loader, SlidingPanel, ...
│       ├── hooks/
│       ├── lib/                         # api.ts (axios), validations
│       ├── providers/                   # Redux, Lenis
│       ├── store/slices/                # authSlice
│       └── types/
│
├── backend/                             # Express API
│   └── src/
│       ├── config/                      # env loader + DB connect
│       ├── controllers/                 # 9 controllers
│       ├── middleware/                  # auth, validate, upload (multer), errors
│       ├── models/                      # User, Subject, Quiz, QuizAttempt,
│       │                                #  Progress, Insight, Syllabus
│       ├── routes/                      # 9 route files (+ /health)
│       ├── scripts/
│       │   └── migrateToTenancy.js      # One-shot multi-tenancy migration
│       ├── services/
│       │   ├── gemini.service.js        # Quiz, topics, insights, recommendations
│       │   ├── youtube.service.js       # YouTube search
│       │   └── documentExtractor.service.js   # PDF / DOCX / TXT → text
│       ├── utils/                       # tokens, invite codes, visibility filter
│       ├── validators/
│       └── seed.js                      # Seed 8 CSE subjects + 12 quizzes + demo users
│
├── docs/                                # Design notes (untracked, local-only)
├── .husky/                              # Pre-commit hook (runs frontend build)
├── package.json                         # Root: concurrently dev script
└── README.md
```

## Multi-Tenancy Model

- **Teachers** own a private namespace of subjects and quizzes. They get a short invite code (e.g. `TCH-A7K9`).
- **Students** start unattached. They paste a teacher's code into the dashboard banner to "join" that classroom, after which they see public content **plus** that teacher's private content.
- **Admins** see everything and are the only role that can toggle a subject or quiz to `visibility: "public"`. Public content is the shared library (the seeded CSE syllabus is set to public so every account sees it).
- Read endpoints (subjects, quizzes, students, progress, insights, attempts) apply a role-based filter so teachers can only see their own students and content.

See [`MULTI_TENANCY_PLAN.md`](./MULTI_TENANCY_PLAN.md) (local file) for the original design notes.

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas (or a local Mongo instance)
- Google Gemini API key
- YouTube Data API v3 key

### Install

```bash
git clone <repo-url>
cd LearnInsight

npm install                    # Root deps (husky, concurrently)
cd frontend && npm install
cd ../backend && npm install
cd ..
```

### Environment

```bash
cp backend/.env.example backend/.env
```

`backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/learninsight
JWT_SECRET=replace_me
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=...
YOUTUBE_DATA_API_V3=...
```

`frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

The backend refuses to start if `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, or `YOUTUBE_DATA_API_V3` is missing.

### Run

```bash
npm run dev               # Frontend (3000) + Backend (5000) via concurrently
npm run dev:frontend
npm run dev:backend
```

Backend request logs (morgan, plain format) are emitted to stderr so they appear under the `[1]` prefix when running through `concurrently`.

### Seeding & migrations

```bash
# From the backend/ directory
node src/seed.js                       # 8 CSE subjects, 12 quizzes, demo users.
                                       # Expects yadav@teacher.edu.in and
                                       # yadav@student.edu.in to already exist.
node src/scripts/migrateToTenancy.js   # Idempotent: flips legacy content to
                                       # visibility=public and mints invite
                                       # codes for any teacher without one.
```

## Feature Tour

### AI-driven syllabus → quiz pipeline
- Teacher uploads a PDF / DOCX / TXT via the syllabus page (drag-drop or click; 10 MB limit).
- Server extracts text (`pdf-parse` / `mammoth` / UTF-8), normalises whitespace, caps to 200 k chars.
- "Extract Topics" calls Gemini with a structured JSON schema and returns a topic + subtopic outline, shown in a left **SlidingPanel**.
- "Generate Quiz" sends the extracted text to `gemini-2.5-flash` with a strict schema for 4-option MCQs plus an explanation, and saves an unpublished `Quiz` linked back to the syllabus.

### Insights + recommendations
- A student triggers insight generation; the backend aggregates per-subject quiz stats and classifies weak / strong areas.
- `gemini-2.5-pro` writes a 3-4 sentence summary; `gemini-2.5-flash` writes targeted YouTube search queries that are then resolved against the YouTube Data API (thumbnails + URL).
- Recommendations render with the real YouTube thumbnail and an "AI" tag.

### Classroom management
- Teacher dashboard shows a Classroom card with the invite code (copy + regenerate-with-confirm) and a live student count.
- Student dashboard shows a "Join your teacher" banner with a code-entry modal until they are attached.
- Teacher's students list and per-student detail page are scoped server-side to that teacher.

## API Endpoints

Base path: `/api/v1`. All routes except `/auth/register` and `/auth/login` require auth (cookie or `Authorization: Bearer <token>`).

| Resource | # | Access |
|----------|---|--------|
| `/auth` | 6 | Public for register/login; rest private |
| `/users` | 12 | Tenancy-aware. Admins see all; teachers see only own students; students self-manage |
| `/subjects` | 8 | Visibility filtered (public / own teacher / admin) |
| `/quizzes` | 8 | Visibility filtered |
| `/attempts` | 6 | Owner / teacher of student / admin |
| `/progress` | 7 | Owner / teacher of student / admin |
| `/insights` | 5 | Owner / teacher of student / admin |
| `/syllabus` | 8 | Owner / admin. Includes `POST /syllabus/upload` (multipart) |
| `/youtube` | 1 | Teacher / admin: `GET /youtube/search` |

**Total: 61 endpoints + `/health`.** See `backend/README.md` for per-endpoint detail.

### Notable user endpoints (added in the multi-tenancy work)

| Method | Path | Role |
|--------|------|------|
| `GET` | `/users/me/invite-code` | Teacher (lazily mints a code if missing) |
| `POST` | `/users/me/regenerate-invite-code` | Teacher |
| `POST` | `/users/join-teacher` | Student |
| `DELETE` | `/users/me/teacher` | Student |
| `POST` | `/users/:id/remove-student` | Teacher / admin |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run frontend + backend via concurrently |
| `npm run dev:frontend` | Frontend only (port 3000) |
| `npm run dev:backend` | Backend only (port 5000), nodemon-watched |
| `npm run dev:backend:pm2` | Backend under pm2-dev (alternative) |
| `npm run build` | Build frontend (run by the husky pre-commit hook) |
| `npm run lint` | Run frontend ESLint |
| `node backend/src/seed.js` | Seed demo content |
| `node backend/src/scripts/migrateToTenancy.js` | One-shot tenancy migration |

## Status

| Area | Status |
|------|--------|
| Backend models, routes, controllers | Complete |
| JWT auth + role middleware | Complete |
| Multi-tenancy (teachers, students, visibility, migrations) | Complete |
| Gemini integration (quizzes, topics, summaries, recommendations) | Complete |
| YouTube Data API integration | Complete |
| Syllabus document upload + extraction | Complete |
| Student + teacher dashboards, charts | Complete |
| CI/CD, deploy | Not started |

## License

ISC

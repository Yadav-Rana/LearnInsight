# LearnInsight

AI-Powered Learning Progress & Insight Platform

## Overview

LearnInsight is a full-featured learning analytics system where students can track progress, the system detects weak areas, and AI recommends personalized YouTube videos + study content.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, TypeScript, TailwindCSS 4 |
| Animations | Framer Motion, Lottie, Lenis |
| State | Redux Toolkit (planned) |
| Backend | Express 5, Node.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + HTTP-only cookies |
| AI | Gemini API (planned) |

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
├── backend/                  # Express API
│   ├── src/
│   │   ├── config/           # Configuration & DB connection
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Auth, error handling, validation
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API routes
│   │   ├── validators/       # Input validation
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Helper functions
│   │   ├── app.js            # Express app setup
│   │   └── server.js         # Entry point
│   └── package.json
│
├── .husky/                   # Git hooks (pre-commit build check)
├── package.json              # Root scripts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd LearnInsight

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### Environment Setup

Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

Update the `.env` file with your values:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/learninsight
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
FRONTEND_URL=http://localhost:3000
```

### Running the Project

```bash
# From root directory - run both frontend and backend
npm run dev

# Or run separately:
npm run dev:frontend    # Frontend on http://localhost:3000
npm run dev:backend     # Backend on http://localhost:5000
```

## Progress Tracker

### Phase 1: Foundation

#### Phase 1A: Backend Models - COMPLETED

- [x] **User** - Roles (student/teacher/admin), enrolled subjects, password hashing
- [x] **Subject** - Flexible hierarchy (parent-child), embedded resources
- [x] **Quiz** - Questions with options, points, AI-generated flag, time limit
- [x] **QuizAttempt** - Answer tracking, score calculation, time taken
- [x] **Progress** - Per-user per-subject tracking, quiz stats
- [x] **Insight** - Weak areas, strengths, AI recommendations
- [x] **Syllabus** - Upload content for AI quiz generation

#### Phase 1B: Auth Routes - COMPLETED

- [x] POST `/api/v1/auth/register` - Register new user
- [x] POST `/api/v1/auth/login` - Login & get JWT token
- [x] POST `/api/v1/auth/logout` - Logout & clear cookie
- [x] GET `/api/v1/auth/me` - Get current user profile
- [x] PUT `/api/v1/auth/update-profile` - Update profile
- [x] PUT `/api/v1/auth/change-password` - Change password

#### Phase 1C: Frontend Auth - PENDING

- [ ] Redux store setup
- [ ] Login page
- [ ] Register page
- [ ] Protected routes

### Phase 2: Core Modules - PENDING

- [ ] Subject CRUD
- [ ] Quiz CRUD
- [ ] Student enrollment
- [ ] Quiz taking flow
- [ ] Progress tracking

### Phase 3: AI Layer - PENDING

- [ ] Gemini API integration
- [ ] Syllabus upload + quiz generation
- [ ] Weakness detection
- [ ] Insight generation
- [ ] YouTube API search

### Phase 4: Dashboard & Analytics - PENDING

- [ ] Student dashboard
- [ ] Teacher dashboard
- [ ] Admin panel
- [ ] Charts (Recharts)

### Phase 5: Polish & Deploy - PENDING

- [ ] UI polish
- [ ] Error handling
- [ ] CI/CD
- [ ] Deployment

## Database Models

### User
```javascript
{
  name, email, password, avatar,
  role: "student" | "teacher" | "admin",
  enrolledSubjects: [ObjectId],
  isActive: Boolean
}
```

### Subject (Flexible Hierarchy)
```javascript
{
  name, description, icon,
  parent: ObjectId | null,
  level: Number,
  createdBy: ObjectId,
  resources: [{ title, url, type }]
}
```

### Quiz
```javascript
{
  title, description, subject,
  questions: [{ question, options, correctAnswer, explanation, points }],
  createdBy, isAIGenerated, difficulty, timeLimit, passingScore
}
```

### QuizAttempt
```javascript
{
  user, quiz,
  answers: [{ questionId, selectedAnswer, isCorrect, pointsEarned }],
  score, totalPoints, percentage, passed, timeTaken
}
```

### Progress
```javascript
{
  user, subject, completionRate, totalTimeSpent,
  lastActivity, quizAttempts, quizStats, viewedResources
}
```

### Insight
```javascript
{
  user, weakAreas, strengths, recommendations,
  aiSummary, overallStats, generatedAt
}
```

### Syllabus
```javascript
{
  user, subject, title, content, fileName,
  generatedQuizzes, extractedTopics, status
}
```

## API Endpoints

### Health Check
```
GET /api/v1/health
```

### Auth
```
POST /api/v1/auth/register        # Register new user
POST /api/v1/auth/login           # Login
POST /api/v1/auth/logout          # Logout (protected)
GET  /api/v1/auth/me              # Get current user (protected)
PUT  /api/v1/auth/update-profile  # Update profile (protected)
PUT  /api/v1/auth/change-password # Change password (protected)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run frontend + backend concurrently |
| `npm run dev:frontend` | Run frontend only |
| `npm run dev:backend` | Run backend only |
| `npm run build` | Build frontend for production |
| `npm run lint` | Run ESLint on frontend |

## License

ISC

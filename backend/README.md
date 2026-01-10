# LearnInsight Backend

Express.js API server for the LearnInsight platform.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** MongoDB + Mongoose 9
- **Authentication:** JWT + bcryptjs
- **Security:** Helmet, CORS
- **Validation:** express-validator
- **Logging:** Morgan

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── index.js          # Environment config
│   │   └── database.js       # MongoDB connection
│   │
│   ├── controllers/          # Route handlers (coming soon)
│   │
│   ├── middleware/
│   │   ├── index.js          # Export all middleware
│   │   ├── auth.js           # JWT protect & authorize
│   │   ├── errorHandler.js   # AppError class & error handler
│   │   └── validate.js       # Input validation wrapper
│   │
│   ├── models/
│   │   ├── index.js          # Export all models
│   │   ├── User.js           # User schema
│   │   ├── Subject.js        # Subject with hierarchy
│   │   ├── Quiz.js           # Quiz with questions
│   │   ├── QuizAttempt.js    # Quiz attempt tracking
│   │   ├── Progress.js       # Learning progress
│   │   ├── Insight.js        # AI-generated insights
│   │   └── Syllabus.js       # Syllabus for AI quiz gen
│   │
│   ├── routes/
│   │   └── index.js          # API routes
│   │
│   ├── services/             # Business logic (coming soon)
│   │
│   ├── utils/
│   │   ├── apiResponse.js    # Standardized API responses
│   │   └── generateToken.js  # JWT token utilities
│   │
│   ├── app.js                # Express app configuration
│   └── server.js             # Server entry point
│
├── .env.example              # Environment template
├── .gitignore
└── package.json
```

## Installation

```bash
cd backend
npm install
```

## Environment Variables

Create `.env` from template:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT signing | `your_secret_key` |
| `JWT_EXPIRE` | Token expiration | `7d` |
| `COOKIE_EXPIRE` | Cookie expiration (days) | `7` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## Running

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

## Implementation Status

### Completed

#### Config
- [x] Environment configuration (`config/index.js`)
- [x] MongoDB connection with error handling (`config/database.js`)

#### Middleware
- [x] JWT authentication (`protect`)
- [x] Role-based authorization (`authorize`)
- [x] Custom error handling (`AppError`, `errorHandler`)
- [x] 404 handler (`notFound`)
- [x] Input validation wrapper (`validate`)

#### Models
- [x] **User** - name, email, password (hashed), avatar, role, enrolledSubjects
- [x] **Subject** - flexible hierarchy, resources, parent-child relationships
- [x] **Quiz** - questions with options, points, difficulty, time limit
- [x] **QuizAttempt** - answers, score, percentage, pass/fail
- [x] **Progress** - completion rate, time spent, quiz stats
- [x] **Insight** - weak areas, recommendations, AI summary
- [x] **Syllabus** - content for AI quiz generation

#### Utils
- [x] JWT token generation (`generateToken`)
- [x] Token response with cookie (`sendTokenResponse`)
- [x] API response helpers (`ApiResponse`)

#### App Setup
- [x] Express app with security (Helmet, CORS)
- [x] Body parser with limits
- [x] Cookie parser
- [x] Morgan logging (dev mode)
- [x] Error handling middleware
- [x] Graceful shutdown handlers

### Pending

#### Routes (Phase 1B)
- [ ] Auth routes (register, login, logout, me)
- [ ] User routes
- [ ] Subject routes
- [ ] Quiz routes
- [ ] Progress routes
- [ ] Insight routes

#### Controllers (Phase 1B)
- [ ] Auth controller
- [ ] User controller
- [ ] Subject controller
- [ ] Quiz controller
- [ ] Progress controller
- [ ] Insight controller

#### Services (Phase 3)
- [ ] AI service (Gemini integration)
- [ ] Quiz generation service
- [ ] Insight generation service
- [ ] YouTube search service

## API Endpoints

### Available Now

```
GET  /                    # API info
GET  /api/v1/health       # Health check
```

### Coming Soon (Phase 1B)

```
POST /api/v1/auth/register       # Register user
POST /api/v1/auth/login          # Login
POST /api/v1/auth/logout         # Logout
GET  /api/v1/auth/me             # Get current user
PUT  /api/v1/auth/update-profile # Update profile
```

## Models Reference

### User
```javascript
{
  name: String,           // required, max 50 chars
  email: String,          // required, unique, lowercase
  password: String,       // required, min 6 chars, hashed
  avatar: String,         // optional
  role: String,           // "student" | "teacher" | "admin"
  enrolledSubjects: [ObjectId],
  isActive: Boolean
}
```

### Subject
```javascript
{
  name: String,           // required, max 100 chars
  description: String,    // max 500 chars
  icon: String,
  parent: ObjectId,       // null = root subject
  level: Number,          // 0 = root, 1 = chapter, etc.
  order: Number,          // display order
  createdBy: ObjectId,
  resources: [{
    title: String,
    url: String,
    type: "youtube" | "article" | "pdf" | "other",
    description: String
  }],
  isActive: Boolean
}
```

### Quiz
```javascript
{
  title: String,
  description: String,
  subject: ObjectId,
  questions: [{
    question: String,
    options: [String],      // 2-6 options
    correctAnswer: Number,  // index
    explanation: String,
    points: Number
  }],
  createdBy: ObjectId,
  isAIGenerated: Boolean,
  difficulty: "easy" | "medium" | "hard",
  timeLimit: Number,        // minutes, null = unlimited
  passingScore: Number,     // percentage
  isPublished: Boolean,
  totalPoints: Number       // auto-calculated
}
```

### QuizAttempt
```javascript
{
  user: ObjectId,
  quiz: ObjectId,
  answers: [{
    questionId: ObjectId,
    selectedAnswer: Number,
    isCorrect: Boolean,
    pointsEarned: Number
  }],
  score: Number,
  totalPoints: Number,
  percentage: Number,
  passed: Boolean,
  timeTaken: Number,        // seconds
  startedAt: Date,
  completedAt: Date
}
```

### Progress
```javascript
{
  user: ObjectId,
  subject: ObjectId,
  completionRate: Number,   // 0-100
  totalTimeSpent: Number,   // seconds
  lastActivity: Date,
  quizAttempts: [ObjectId],
  quizStats: {
    totalAttempts: Number,
    averageScore: Number,
    bestScore: Number,
    passedCount: Number
  },
  viewedResources: [{ resourceId, viewedAt }],
  notes: String
}
```

### Insight
```javascript
{
  user: ObjectId,
  weakAreas: [{
    subject: ObjectId,
    reason: String,
    severity: "low" | "medium" | "high",
    averageScore: Number,
    suggestedAction: String
  }],
  strengths: [{ subject, reason, averageScore }],
  recommendations: [{
    title: String,
    url: String,
    type: "youtube" | "article" | "pdf" | "course" | "other",
    relevance: Number,      // 0-100
    relatedSubject: ObjectId,
    isAIGenerated: Boolean
  }],
  aiSummary: String,
  overallStats: { ... },
  generatedAt: Date,
  isViewed: Boolean
}
```

### Syllabus
```javascript
{
  user: ObjectId,
  subject: ObjectId,
  title: String,
  content: String,
  fileName: String,
  fileType: "pdf" | "text" | "docx" | "manual",
  generatedQuizzes: [ObjectId],
  extractedTopics: [{ topic, subtopics }],
  status: "pending" | "processing" | "completed" | "failed",
  processingError: String,
  uploadedAt: Date
}
```

## Error Handling

All errors follow this format:

```javascript
// Development
{
  success: false,
  status: "fail" | "error",
  message: "Error message",
  stack: "...",
  error: { ... }
}

// Production
{
  success: false,
  status: "fail" | "error",
  message: "Error message"
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start production server |

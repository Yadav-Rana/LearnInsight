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
│   │   ├── index.js              # Environment config
│   │   └── database.js           # MongoDB connection
│   │
│   ├── controllers/
│   │   ├── auth.controller.js    # Auth handlers
│   │   ├── user.controller.js    # User management
│   │   ├── subject.controller.js # Subject CRUD
│   │   ├── quiz.controller.js    # Quiz CRUD
│   │   ├── quizAttempt.controller.js # Quiz attempts
│   │   ├── progress.controller.js    # Progress tracking
│   │   ├── insight.controller.js     # AI insights
│   │   └── syllabus.controller.js    # Syllabus & AI quiz gen
│   │
│   ├── middleware/
│   │   ├── index.js              # Export all middleware
│   │   ├── auth.js               # JWT protect & authorize
│   │   ├── errorHandler.js       # AppError & error handler
│   │   └── validate.js           # Input validation wrapper
│   │
│   ├── models/
│   │   ├── index.js              # Export all models
│   │   ├── User.js
│   │   ├── Subject.js
│   │   ├── Quiz.js
│   │   ├── QuizAttempt.js
│   │   ├── Progress.js
│   │   ├── Insight.js
│   │   └── Syllabus.js
│   │
│   ├── routes/
│   │   ├── index.js              # Main router
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── subject.routes.js
│   │   ├── quiz.routes.js
│   │   ├── quizAttempt.routes.js
│   │   ├── progress.routes.js
│   │   ├── insight.routes.js
│   │   └── syllabus.routes.js
│   │
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── user.validator.js
│   │   ├── subject.validator.js
│   │   ├── quiz.validator.js
│   │   ├── quizAttempt.validator.js
│   │   ├── progress.validator.js
│   │   ├── insight.validator.js
│   │   └── syllabus.validator.js
│   │
│   ├── services/                 # Business logic (AI - Phase 3)
│   │
│   ├── utils/
│   │   ├── apiResponse.js
│   │   └── generateToken.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env.example
├── .gitignore
└── package.json
```

## Installation

```bash
cd backend
npm install
```

## Environment Variables

```bash
cp .env.example .env
```

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
npm run dev    # Development (nodemon)
npm start      # Production
```

## API Endpoints

### Health Check
```
GET  /api/v1/health
```

### Auth
```
POST /api/v1/auth/register           # Register new user
POST /api/v1/auth/login              # Login
POST /api/v1/auth/logout             # Logout (protected)
GET  /api/v1/auth/me                 # Get current user (protected)
PUT  /api/v1/auth/update-profile     # Update profile (protected)
PUT  /api/v1/auth/change-password    # Change password (protected)
```

### Users (Admin/Teacher)
```
GET    /api/v1/users                 # Get all users (admin)
GET    /api/v1/users/role/:role      # Get users by role (admin)
GET    /api/v1/users/:id             # Get single user
PUT    /api/v1/users/:id             # Update user (admin)
DELETE /api/v1/users/:id             # Delete user (admin)
POST   /api/v1/users/:id/enroll      # Enroll user in subject
DELETE /api/v1/users/:id/enroll/:subjectId  # Unenroll user
```

### Subjects
```
GET    /api/v1/subjects              # Get all subjects (?tree=true for hierarchy)
GET    /api/v1/subjects/:id          # Get single subject
POST   /api/v1/subjects              # Create subject (admin/teacher)
PUT    /api/v1/subjects/:id          # Update subject (admin/teacher)
DELETE /api/v1/subjects/:id          # Delete subject (admin)
GET    /api/v1/subjects/:id/hierarchy # Get breadcrumb hierarchy
POST   /api/v1/subjects/:id/resources # Add resource (admin/teacher)
DELETE /api/v1/subjects/:id/resources/:resourceId # Remove resource
```

### Quizzes
```
GET    /api/v1/quizzes               # Get all quizzes
GET    /api/v1/quizzes/:id           # Get single quiz
POST   /api/v1/quizzes               # Create quiz (admin/teacher)
PUT    /api/v1/quizzes/:id           # Update quiz (admin/teacher)
DELETE /api/v1/quizzes/:id           # Delete quiz (admin/teacher)
PUT    /api/v1/quizzes/:id/publish   # Toggle publish (admin/teacher)
POST   /api/v1/quizzes/:id/duplicate # Duplicate quiz (admin/teacher)
GET    /api/v1/quizzes/subject/:subjectId # Get quizzes by subject
```

### Quiz Attempts
```
POST   /api/v1/attempts              # Submit quiz attempt
GET    /api/v1/attempts              # Get my attempts
GET    /api/v1/attempts/stats        # Get my stats
GET    /api/v1/attempts/:id          # Get single attempt
GET    /api/v1/attempts/quiz/:quizId # Get attempts by quiz (admin/teacher)
GET    /api/v1/attempts/quiz/:quizId/best # Get my best attempt for quiz
```

### Progress
```
GET    /api/v1/progress              # Get my progress (all subjects)
GET    /api/v1/progress/subject/:subjectId # Get progress for subject
PUT    /api/v1/progress/subject/:subjectId # Update progress
POST   /api/v1/progress/subject/:subjectId/resource # Mark resource viewed
GET    /api/v1/progress/subject/:subjectId/leaderboard # Get leaderboard
GET    /api/v1/progress/subject/:subjectId/students # Get all students (admin/teacher)
GET    /api/v1/progress/user/:userId # Get student progress (admin/teacher)
```

### Insights
```
POST   /api/v1/insights/generate     # Generate new insights
GET    /api/v1/insights              # Get my insights history
GET    /api/v1/insights/latest       # Get latest insight
GET    /api/v1/insights/:id          # Get single insight
GET    /api/v1/insights/user/:userId # Get student insights (admin/teacher)
```

### Syllabus
```
GET    /api/v1/syllabus              # Get my syllabuses
POST   /api/v1/syllabus              # Upload syllabus
GET    /api/v1/syllabus/:id          # Get single syllabus
PUT    /api/v1/syllabus/:id          # Update syllabus
DELETE /api/v1/syllabus/:id          # Delete syllabus
POST   /api/v1/syllabus/:id/generate-quiz   # Generate quiz from syllabus (AI)
POST   /api/v1/syllabus/:id/extract-topics  # Extract topics (AI)
```

## Implementation Status

### Completed
- [x] All 7 database models
- [x] Auth system (register, login, logout, JWT)
- [x] User management (CRUD, enrollment)
- [x] Subject management (CRUD, hierarchy, resources)
- [x] Quiz management (CRUD, publish, duplicate)
- [x] Quiz attempts (submit, stats, leaderboard)
- [x] Progress tracking (per subject, resources viewed)
- [x] Insights (generation, weak areas, recommendations)
- [x] Syllabus (upload, AI quiz generation placeholder)
- [x] Input validation for all routes
- [x] Error handling middleware
- [x] Role-based authorization

### Pending (Phase 3)
- [ ] Gemini API integration for quiz generation
- [ ] Gemini API integration for topic extraction
- [ ] YouTube API for video recommendations
- [ ] AI-powered insight generation

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon |
| `npm start` | Start production server |

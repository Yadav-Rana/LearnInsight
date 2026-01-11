// User types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  avatar?: string;
  enrolledSubjects: string[];
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role?: "student" | "teacher";
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// Subject types
export interface Resource {
  _id: string;
  title: string;
  url: string;
  type: "youtube" | "article" | "pdf";
  addedAt: string;
}

export interface Subject {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  parent?: string | null;
  level: number;
  createdBy: string;
  resources: Resource[];
  children?: Subject[];
  createdAt: string;
  updatedAt: string;
}

// Quiz types
export interface Question {
  _id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
}

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  subject: string | Subject;
  questions: Question[];
  createdBy: string;
  isAIGenerated: boolean;
  difficulty: "easy" | "medium" | "hard";
  timeLimit?: number;
  passingScore: number;
  isPublished: boolean;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
}

// Quiz Attempt types
export interface QuizAttempt {
  _id: string;
  user: string | User;
  quiz: string | Quiz;
  answers: number[];
  score: number;
  percentage: number;
  passed: boolean;
  timeTaken?: number;
  completedAt: string;
}

// Progress types
export interface QuizStats {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  lastAttemptAt?: string;
}

export interface Progress {
  _id: string;
  user: string | User;
  subject: string | Subject;
  completionRate: number;
  totalTimeSpent: number;
  lastActivity: string;
  resourcesViewed: string[];
  quizStats: QuizStats;
  createdAt: string;
  updatedAt: string;
}

// Insight types
export interface WeakArea {
  subject: string | Subject;
  reason: string;
  score?: number;
}

export interface Strength {
  subject: string | Subject;
  score: number;
}

export interface Recommendation {
  title: string;
  url: string;
  type: "youtube" | "article" | "practice";
  relevance: number;
  reason?: string;
}

export interface Insight {
  _id: string;
  user: string | User;
  weakAreas: WeakArea[];
  strengths: Strength[];
  recommendations: Recommendation[];
  aiSummary?: string;
  generatedAt: string;
}

// Syllabus types
export interface ExtractedTopic {
  topic: string;
  subtopics: string[];
}

export interface Syllabus {
  _id: string;
  user: string | User;
  subject: string | Subject;
  title: string;
  content: string;
  fileName?: string;
  fileType: "pdf" | "text" | "manual";
  status: "pending" | "processing" | "completed" | "failed";
  extractedTopics: ExtractedTopic[];
  generatedQuizzes: string[] | Quiz[];
  processingError?: string;
  uploadedAt: string;
}

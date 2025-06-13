import { EnrolledCourse, Level, PurchaseStatus } from "../types";

// Base types
export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "SINGLE_CHOICE"
  | "TRUE_FALSE"
  | "TEXT"
  | "NUMBER";

// Question Option Interface
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  questionId: string;
}

// Question Interface
export interface QuizQuestion {
  id: string;
  text: string;
  type: QuestionType;
  points: number;
  explanation: string | null;
  quizId: string;
  createdAt: string;
  updatedAt: string;
  options: QuestionOption[];
}

// Course Interface (simplified for quiz context)
export interface QuizCourse {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  isPublished: boolean;
  teacherId: string;
  categoryId: string;
  language: string | null;
  level: Level;
  duration: number | null;
  totalSteps: number;
  rating: number | null;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  enrolledStudents: EnrolledCourse[];
}

// Chapter Interface (for quiz context)
export interface QuizChapter {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  position: number;
  isPublished: boolean;
  isFree: boolean;
  duration: number;
  courseId: string;
  createdAt: string;
  updatedAt: string;
  course: QuizCourse;
}

// Quiz attempt metadata from API
export interface QuizAttemptMetadata {
  hasAttempted: boolean;
  bestScore: number;
  averageScore: number;
  totalAttempts: number;
  hasPassed: boolean;
  canRetake: boolean;
  attemptsRemaining: number;
  latestAttempt: {
    id: string;
    score: number;
    completedAt: string;
  } | null;
}

// Main Quiz Interface
export interface StudentQuiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  chapterId: string;
  createdAt: string;
  updatedAt: string;
  questions: QuizQuestion[];
  chapter: QuizChapter;
  _attemptData?: QuizAttemptMetadata;
}

// Quiz attempt related types
export interface QuizAnswer {
  questionId: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[]; // For multiple choice
  textAnswer?: string;
}

export interface StudentAnswer {
  id: string;
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
  isCorrect: boolean;
  pointsEarned: number;
  attemptId: string;
  question: {
    text: string;
    explanation?: string;
  };
  selectedOption?: {
    text: string;
    isCorrect: boolean;
  };
}

export interface QuizAttempt {
  id: string;
  score: number;
  startedAt: string;
  completedAt: string;
  quizId: string;
  studentId: string;
  userProgressId?: string;
  answers: StudentAnswer[];
  quiz: {
    id: string;
    title: string;
    passingScore: number;
  };
}

// API Response types
export interface SubmitQuizAttemptData {
  quizId: string;
  answers: QuizAnswer[];
}

export interface SubmitQuizAttemptResponse {
  message: string;
  attempt: QuizAttempt;
  score: number;
  passed: boolean;
}

export interface QuizAttemptsResponse {
  attempts: QuizAttempt[];
}

// Quiz statistics types
export interface QuizStats {
  totalAttempts: number;
  bestScore: number;
  averageScore: number;
  lastAttemptDate: string | null;
  hasCompleted: boolean;
  hasPassed: boolean;
  improvement: number; // Score improvement from first to last attempt
}

export interface QuizRetakeInfo {
  canRetake: boolean;
  attemptsRemaining: number;
  bestScore: number;
  averageScore: number;
  latestAttempt: QuizAttempt | null;
  totalAttempts: number;
  maxAttempts: number;
}

// Chapter quiz summary for listing
export interface ChapterQuizSummary {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore: number;
  questionCount: number;
  bestScore: number;
  totalAttempts: number;
  hasPassed: boolean;
  lastAttemptDate?: string;
  canRetake: boolean;
  attemptsRemaining: number;
}

// Quiz taking state types
export interface QuizTakingState {
  currentQuestionIndex: number;
  answers: Record<string, QuizAnswer>;
  timeRemaining: number | null;
  quizStarted: boolean;
  isSubmitting: boolean;
}

// Quiz navigation types
export interface QuizNavigation {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  progress: number; // 0-100
}

// Hook query parameters
export interface UseQuizAttemptsQuery {
  quizId?: string;
  chapterId?: string;
}

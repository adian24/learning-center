import { Course } from "./course";

// Chapter related types
export interface Chapter {
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
  course?: Course;
}

export interface ChapterWithProgress extends Chapter {
  userProgress?: ChapterProgress[];
  quizzes?: QuizSummary[];
  resources?: Resource[];
}

export interface ChapterProgress {
  id: string;
  studentId: string;
  chapterId: string;
  isCompleted: boolean;
  chapterScore: number | null;
  watchedSeconds: number;
  lastWatchedAt: string | null;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  title: string;
  type: "PDF" | "LINK" | "FILE";
  url: string;
  chapterId: string;
}

export interface QuizSummary {
  id: string;
  title: string;
  questionCount: number;
  passingScore: number;
}

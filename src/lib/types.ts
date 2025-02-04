// Types for course level
export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

// Types for course status (bisa ditambahkan sesuai kebutuhan)
export type CourseStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";

// Interface untuk data course
export interface Course {
  id: number | string;
  title: string;
  description: string;
  imageUrl: string;
  enrolledCount: number;
  totalChapters: number;
  price: number;
  isPublished: boolean;
  level: CourseLevel;
  lastUpdated: string;
}

// Props untuk komponen Course Card
export interface CourseCardProps {
  course: Course;
  onEdit?: (courseId: Course["id"]) => void;
  onDelete?: (courseId: Course["id"]) => void;
  onPublish?: (courseId: Course["id"]) => void;
}

// Props untuk Course List Container
export interface CourseListProps {
  courses: Course[];
  // viewType: "grid" | "list";
  // onViewChange: (view: "grid" | "list") => void;
  // onSearch?: (query: string) => void;
  // onFilterStatus?: (status: CourseStatus | "all") => void;
  // onFilterLevel?: (level: CourseLevel | "all") => void;
}

// Type untuk filter options
export interface CourseFilters {
  search?: string;
  status?: CourseStatus | "all";
  level?: CourseLevel | "all";
}

// Interface untuk statistik course
export interface CourseStats {
  totalStudents: number;
  completionRate: number;
  averageRating?: number;
  revenue?: number;
}

// Props untuk Course Table Row
export interface CourseTableRowProps {
  course: Course;
  onAction: (
    action: "edit" | "delete" | "publish" | "chapters" | "quiz",
    courseId: Course["id"]
  ) => void;
}

// Props untuk Course Actions
export interface CourseActionsProps {
  courseId: Course["id"];
  isPublished: boolean;
  onAction: (action: string) => void;
}

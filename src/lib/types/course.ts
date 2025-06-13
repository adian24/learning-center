// Course related types
export type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type PurchaseStatus = "PENDING" | "COMPLETED" | "REFUNDED" | "FAILED";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface EnrolledCourse {
  id: string;
  studentId: string;
  courseId: string;
  amount: number;
  currency: string;
  paymentId: string;
  status: PurchaseStatus;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
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
  category?: Category;
  enrolledStudents?: EnrolledCourse[];
}

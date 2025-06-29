import { useQuery } from "@tanstack/react-query";

export interface Course {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  isPublished: boolean;
  isEnrolled?: boolean;
  teacherId: string;
  teacher: {
    id: string;
    user: {
      name: string | null;
      image: string | null;
    };
    bio: string | null;
    expertise: string[] | null;
    profileUrl: string | null;
    company: {
      id: string;
      name: string;
      description: string | null;
      logoUrl: string | null;
      location: string | null;
      website: string | null;
      industry: string | null;
      isVerified: boolean;
    } | null;
  };
  categoryId: string | null;
  category: {
    id: string;
    name: string;
  } | null;
  chapters: Array<{
    id: string;
    title: string;
    description: string | null;
    position: number;
    isFree: boolean;
    videoUrl: string | null;
    duration: number | null;
    resources: Array<{
      id: string;
      title: string;
      url: string;
      type: string;
    }>;
    quizzes: Array<{
      id: string;
      title: string;
      description: string | null;
    }>;
    userProgress: Array<{
      id: string;
      isCompleted: boolean;
      watchedSeconds: number;
      lastWatchedAt: string | null;
    }>;
  }>;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  duration: number | null;
  createdAt: string;
  updatedAt: string;
  rating: number | null;
  reviewCount: number | null;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  pdfUrl: string | null;
  issueDate: string;
}

export interface CourseResponse {
  course: Course;
  certificate: Certificate | null;
  studentId: string;
}

export const useCourse = (courseId: string) => {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: async (): Promise<CourseResponse> => {
      const res = await fetch(`/api/courses/${courseId}`);

      if (!res.ok) {
        throw new Error("Failed to fetch course");
      }

      return res.json();
    },
    enabled: !!courseId,
  });
};

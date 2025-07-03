import { useQuery } from "@tanstack/react-query";

export interface TeacherCourse {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  level: string;
  duration: number | null;
  totalSteps: number;
  rating: number | null;
  reviewCount: number;
  language: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  categoryId: string | null;
  teacherId: string;
  teacher: {
    id: string;
    userId: string;
    profileUrl: string | null;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
    company: {
      id: string;
      name: string;
      logoUrl: string | null;
      location: string | null;
      industry: string | null;
    } | null;
  };
  chapters: any[];
  enrolledCount: number;
  _count: {
    enrolledStudents: number;
  };
}

export interface TeacherCoursesResponse {
  courses: TeacherCourse[];
  meta: {
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface UseTeacherCoursesQueryParams {
  page?: number;
  perPage?: number;
}

export const useTeacherCoursesQuery = (params: UseTeacherCoursesQueryParams = {}) => {
  const { page = 1, perPage = 10 } = params;

  const searchParams = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
  });

  return useQuery<TeacherCoursesResponse>({
    queryKey: ["teacher-courses", { page, perPage }],
    queryFn: async () => {
      const response = await fetch(`/api/teacher/courses?${searchParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch teacher courses");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
import { useQuery } from "@tanstack/react-query";

export interface CourseWithCompany {
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
  teacherName: string | null;
  teacherProfileUrl: string | null;
  teacherCompany: {
    id: string;
    name: string;
    logoUrl: string | null;
    location: string | null;
    industry: string | null;
  } | null;
  enrolledCount: number;
  chapterCount: number;
  isEnrolled: boolean;
}

export interface CoursesResponse {
  courses: CourseWithCompany[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalCourses: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface UseCoursesQueryParams {
  page?: number;
  perPage?: number;
  categoryId?: string;
  search?: string;
  level?: string;
}

export const useCoursesQuery = (params: UseCoursesQueryParams = {}) => {
  const { page = 1, perPage = 10, categoryId, search, level } = params;

  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: perPage.toString(),
    ...(categoryId && { categoryId }),
    ...(search && { search }),
    ...(level && { level }),
  });

  return useQuery<CoursesResponse>({
    queryKey: ["courses", { page, perPage, categoryId, search, level }],
    queryFn: async () => {
      const response = await fetch(`/api/courses?${searchParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

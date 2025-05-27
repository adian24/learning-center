import { useQuery } from "@tanstack/react-query";

interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  image?: string;
  enrolledCourses: string[];
  enrollmentDate: string;
  progressPercentage: number;
}

interface StudentsResponse {
  students: Student[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalStudents: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  stats: {
    totalStudents: number;
    averageProgress: number;
    recentStudents: number;
  };
}

interface UseStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "enrollmentDate" | "progress";
  sortOrder?: "asc" | "desc";
}

export const useStudents = (params: UseStudentsParams = {}) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "enrollmentDate",
    sortOrder = "desc",
  } = params;

  const query = useQuery<StudentsResponse>({
    queryKey: ["teacher-students", page, limit, search, sortBy, sortOrder],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/teacher/students?${searchParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    students: query.data?.students || [],
    pagination: query.data?.pagination,
    stats: query.data?.stats,
  };
};

// hooks/use-teacher-dashboard.ts
import { useQuery } from "@tanstack/react-query";

type DashboardStats = {
  totalCourses: number;
  totalStudents: number;
  completionRate: number;
  totalRevenue: number;
};

type CourseItem = {
  id: string;
  title: string;
  studentsEnrolled: number;
  status: "Published" | "Draft";
};

// Fetch functions for React Query
const fetchStats = async (): Promise<DashboardStats> => {
  const response = await fetch("/api/teacher/dashboard/stats");

  if (!response.ok) {
    throw new Error("Failed to fetch teacher stats");
  }

  return response.json();
};

const fetchCourses = async (): Promise<CourseItem[]> => {
  const response = await fetch("/api/teacher/dashboard/courses");

  if (!response.ok) {
    throw new Error("Failed to fetch teacher courses");
  }

  return response.json();
};

export const useTeacherStats = () => {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["teacherStats"],
    queryFn: fetchStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    stats,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "An error occurred"
      : null,
  };
};

export const useTeacherCourses = () => {
  const {
    data: courses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["teacherCourses"],
    queryFn: fetchCourses,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    courses,
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "An error occurred"
      : null,
  };
};

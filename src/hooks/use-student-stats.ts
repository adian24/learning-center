import { useQuery } from "@tanstack/react-query";

export interface StudentStats {
  totalCourses: number;
  inProgressCount: number;
  completedCount: number;
  pendingEnrollments: number;
  failedEnrollments: number;
  recentActivity: Array<{
    id: string;
    courseId: string;
    courseTitle: string;
    courseImage: string | null;
    chapterId: string;
    chapterTitle: string;
    isCompleted: boolean;
    updatedAt: string;
  }>;
}

/**
 * Hook to fetch student statistics for dashboard and My Courses page
 * Returns stats like total courses, in progress count, completed count, etc.
 */
export const useStudentStats = () => {
  return useQuery<StudentStats>({
    queryKey: ["studentStats"],
    queryFn: async () => {
      const response = await fetch("/api/student/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch student statistics");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

/**
 * Hook that returns enrollment progress data by status
 * Combines stats API with enrolled courses data for a complete picture
 */
export const useEnrollmentStats = () => {
  const { data: stats, isLoading, error } = useStudentStats();

  return {
    stats: {
      total: stats?.totalCourses || 0,
      inProgress: stats?.inProgressCount || 0,
      completed: stats?.completedCount || 0,
      pending: stats?.pendingEnrollments || 0,
      failed: stats?.failedEnrollments || 0,
    },
    recentActivity: stats?.recentActivity || [],
    isLoading,
    error,
  };
};

// hooks/useSimilarCourses.ts
import { Course } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

interface SimilarCoursesResponse {
  similarCourses: Course[];
  recommendationType: "SAME_TEACHER" | "SAME_CATEGORY" | "POPULAR";
}

/**
 * Hook to fetch similar courses using TanStack Query
 * @param courseId - ID of the current course
 * @param limit - Maximum number of similar courses to return (default: 3)
 * @param enabled - Whether the query should run (default: true)
 */
export function useSimilarCourses(
  courseId: string | undefined,
  limit: number = 3,
  enabled: boolean = true
) {
  return useQuery<SimilarCoursesResponse>({
    queryKey: ["similarCourses", courseId, limit],
    queryFn: async (): Promise<SimilarCoursesResponse> => {
      if (!courseId) {
        throw new Error("Course ID is required");
      }

      const response = await fetch(
        `/api/courses/similar?courseId=${courseId}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch similar courses");
      }

      return response.json();
    },
    enabled: !!courseId && enabled, // Only run the query if courseId exists and enabled is true
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
  });
}

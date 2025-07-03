import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Types for the enrolled courses
export interface EnrolledCourseBase {
  id: string;
  courseId: string;
  studentId: string;
  amount: number;
  currency: string;
  paymentId: string | null;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  validUntil: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrolledCourseWithProgress extends EnrolledCourseBase {
  course: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    price: number | null;
    level: string;
    teacher: {
      user: {
        name: string | null;
        image: string | null;
      };
    };
    chapters: Array<{
      id: string;
      title: string;
      position: number;
      userProgress?: {
        id: string;
        isCompleted: boolean;
        chapterScore: number | null;
        watchedSeconds: number;
        completedAt: Date | null;
      };
      calculation: {
        chapterId: string;
        studentId: string;
        totalQuizzes: number;
        passedQuizzes: number;
        chapterScore: number;
        isCompleted: boolean;
      };
      quizzes: Array<{
        id: string;
        title: string;
        passingScore: number;
        latestAttempt: {
          score: number;
          completedAt: Date;
        } | null;
        isPassed: boolean;
      }>;
    }>;
  };
  progress: number;
  completedChapters: number;
  totalChapters: number;
}

export interface CreateEnrollmentData {
  courseId: string;
  amount: number;
  currency?: string;
}

export interface UpdateEnrollmentData {
  status?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  isActive?: boolean;
  paymentId?: string;
}

/**
 * Hook to fetch all enrolled courses for the current user
 * @param status Optional status filter ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')
 * @param courseId Optional course ID filter
 */
export const useEnrolledCourses = (status?: string, courseId?: string) => {
  const queryParams = new URLSearchParams();

  if (status) {
    queryParams.append("status", status);
  }

  if (courseId) {
    queryParams.append("courseId", courseId);
  }

  const queryString = queryParams.toString();
  const url = `/api/enrollments${queryString ? `?${queryString}` : ""}`;

  return useQuery<EnrolledCourseWithProgress[]>({
    queryKey: ["enrolledCourses", { status, courseId }],
    queryFn: async () => {
      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch enrolled courses");
      }

      return response.json();
    },
  });
};

/**
 * Hook to fetch a specific enrolled course by ID
 * @param enrollmentId The ID of the enrollment to fetch
 */
export const useEnrolledCourse = (enrollmentId?: string) => {
  return useQuery<EnrolledCourseWithProgress>({
    queryKey: ["enrolledCourse", enrollmentId],
    queryFn: async () => {
      if (!enrollmentId) {
        throw new Error("Enrollment ID is required");
      }

      const response = await fetch(`/api/enrollments/${enrollmentId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch enrollment");
      }

      return response.json();
    },
    enabled: !!enrollmentId, // Only run query if enrollmentId is provided
  });
};

/**
 * Hook to create a new enrollment
 */
export const useCreateEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEnrollmentData) => {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create enrollment");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Course enrollment initiated");
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["enrolledCourses"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    },
  });
};

/**
 * Hook to update an enrollment's status
 * @param enrollmentId The ID of the enrollment to update
 */
export const useUpdateEnrollment = (enrollmentId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateEnrollmentData) => {
      if (!enrollmentId) {
        throw new Error("Enrollment ID is required");
      }

      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update enrollment");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Enrollment updated");
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["enrolledCourses"] });
      queryClient.invalidateQueries({
        queryKey: ["enrolledCourse", enrollmentId],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    },
  });
};

/**
 * Hook to cancel an enrollment
 * @param enrollmentId The ID of the enrollment to cancel
 */
export const useCancelEnrollment = (enrollmentId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!enrollmentId) {
        throw new Error("Enrollment ID is required");
      }

      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel enrollment");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Enrollment canceled");
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["enrolledCourses"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    },
  });
};

/**
 * Utility hook that gives enrollments grouped by status
 * Returns all enrollments categorized by their status
 */
export const useGroupedEnrollments = () => {
  const { data: enrollments, isLoading, error } = useEnrolledCourses();

  // Group enrollments by status
  const groupedEnrollments = {
    pending: enrollments?.filter((e) => e.status === "PENDING") || [],
    completed: enrollments?.filter((e) => e.status === "COMPLETED") || [],
    failed: enrollments?.filter((e) => e.status === "FAILED") || [],
    refunded: enrollments?.filter((e) => e.status === "REFUNDED") || [],
  };

  return {
    enrollments: groupedEnrollments,
    isLoading,
    error,
  };
};

/**
 * Hook to check payment status of an enrollment
 * @param enrollmentId The ID of the enrollment to check
 * @param enabled Whether the query should be enabled
 * @param refetchInterval Time in milliseconds between refetches
 */
export const useEnrollmentPaymentStatus = (
  enrollmentId?: string,
  enabled = true,
  refetchInterval = 10000
) => {
  return useQuery({
    queryKey: ["enrollmentPaymentStatus", enrollmentId],
    queryFn: async () => {
      if (!enrollmentId) return null;

      const response = await fetch("/api/payment/check-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enrollmentId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to check payment status");
      }

      return response.json();
    },
    enabled: !!enrollmentId && enabled,
    refetchInterval,
  });
};

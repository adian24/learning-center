// src/hooks/use-course-reviews.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
export interface CourseReview {
  id: string;
  rating: number;
  comment?: string;
  studentId: string;
  courseId: string;
  isVerifiedPurchase: boolean;
  status: "PENDING" | "PUBLISHED" | "REJECTED" | "HIDDEN";
  helpfulCount: number;
  instructorResponse?: string;
  instructorResponseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  student: {
    user: {
      name?: string;
      image?: string;
    };
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  totalPages: number;
  currentPage: number;
}

// API functions
async function fetchReviews(
  courseId: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<CourseReview>> {
  const response = await fetch(
    `/api/courses/${courseId}/reviews?page=${page}&limit=${limit}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch reviews");
  }

  return response.json();
}

async function fetchReview(
  courseId: string,
  reviewId: string
): Promise<CourseReview> {
  const response = await fetch(`/api/courses/${courseId}/reviews/${reviewId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch review");
  }

  return response.json();
}

async function createReview(
  courseId: string,
  data: { rating: number; comment?: string }
): Promise<CourseReview> {
  const response = await fetch(`/api/courses/${courseId}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create review");
  }

  return response.json();
}

async function updateReview(
  courseId: string,
  reviewId: string,
  data: { rating?: number; comment?: string }
): Promise<CourseReview> {
  const response = await fetch(`/api/courses/${courseId}/reviews/${reviewId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update review");
  }

  return response.json();
}

async function deleteReview(
  courseId: string,
  reviewId: string
): Promise<{ success: boolean }> {
  const response = await fetch(`/api/courses/${courseId}/reviews/${reviewId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete review");
  }

  return response.json();
}

async function respondToReview(
  courseId: string,
  reviewId: string,
  response: string
): Promise<CourseReview> {
  const res = await fetch(
    `/api/courses/${courseId}/reviews/${reviewId}/respond`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ response }),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to respond to review");
  }

  return res.json();
}

// React Query Hooks
export function useReviews(courseId: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ["reviews", courseId, page, limit],
    queryFn: () => fetchReviews(courseId, page, limit),
  });
}

export function useReview(courseId: string, reviewId: string) {
  return useQuery({
    queryKey: ["review", courseId, reviewId],
    queryFn: () => fetchReview(courseId, reviewId),
    enabled: !!reviewId,
  });
}

export function useCreateReview(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { rating: number; comment?: string }) =>
      createReview(courseId, data),
    onSuccess: () => {
      // Invalidate reviews query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["reviews", courseId] });
      // Invalidate course query to update rating
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });
}

export function useUpdateReview(courseId: string, reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { rating?: number; comment?: string }) =>
      updateReview(courseId, reviewId, data),
    onSuccess: () => {
      // Invalidate specific review query
      queryClient.invalidateQueries({
        queryKey: ["review", courseId, reviewId],
      });
      // Invalidate reviews list
      queryClient.invalidateQueries({ queryKey: ["reviews", courseId] });
      // Invalidate course query to update rating
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });
}

export function useDeleteReview(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(courseId, reviewId),
    onSuccess: () => {
      // Invalidate reviews query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["reviews", courseId] });
      // Invalidate course query to update rating
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });
}

export function useRespondToReview(courseId: string, reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (response: string) =>
      respondToReview(courseId, reviewId, response),
    onSuccess: () => {
      // Invalidate specific review query
      queryClient.invalidateQueries({
        queryKey: ["review", courseId, reviewId],
      });
      // Invalidate reviews list
      queryClient.invalidateQueries({ queryKey: ["reviews", courseId] });
    },
  });
}

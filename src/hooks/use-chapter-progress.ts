import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserProgress } from "@/lib/types";
import { ChapterScoreCalculation } from "@/lib/services/quiz-score-service";

interface ChapterProgressResponse {
  progress: UserProgress | null;
  calculation: ChapterScoreCalculation;
  hasProgress: boolean;
}

interface CourseProgressResponse {
  courseProgress: Array<{
    chapterId: string;
    chapterTitle: string;
    position: number;
    userProgress: UserProgress | null;
    calculation: ChapterScoreCalculation;
    quizzes: Array<{
      id: string;
      title: string;
      passingScore: number;
      latestAttempt: any;
      isPassed: boolean;
    }>;
  }>;
  courseId: string;
}

interface CanProceedResponse {
  canProceed: boolean;
  chapterId: string;
  message: string;
}

interface UpdateProgressData {
  chapterId: string;
  watchedSeconds?: number;
  isCompleted?: boolean;
  notes?: string;
}

interface UpdateProgressResponse {
  message: string;
  progress: UserProgress;
  chapterScore: number;
  quizSummary: {
    totalQuizzes: number;
    passedQuizzes: number;
    isCompleted: boolean;
  };
}

async function getChapterProgress(
  chapterId: string
): Promise<ChapterProgressResponse> {
  const response = await fetch(
    `/api/student/chapter-progress?chapterId=${chapterId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch chapter progress");
  }

  return response.json();
}

async function getCourseProgress(
  courseId: string
): Promise<CourseProgressResponse> {
  const response = await fetch(
    `/api/student/chapter-progress?courseId=${courseId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch course progress");
  }

  return response.json();
}

async function canProceedToNextChapter(
  chapterId: string
): Promise<CanProceedResponse> {
  const response = await fetch(
    `/api/student/chapter-progress?chapterId=${chapterId}&action=can-proceed`
  );

  if (!response.ok) {
    throw new Error("Failed to check chapter completion");
  }

  return response.json();
}

async function updateProgress(
  data: UpdateProgressData
): Promise<UpdateProgressResponse> {
  const response = await fetch("/api/progress", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update progress");
  }

  return response.json();
}

export function useChapterProgress(chapterId?: string) {
  return useQuery({
    queryKey: ["chapter-progress", chapterId],
    queryFn: () => getChapterProgress(chapterId!),
    enabled: !!chapterId,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    retry: 2,
  });
}

export function useCourseProgress(courseId?: string) {
  return useQuery({
    queryKey: ["course-progress", courseId],
    queryFn: () => getCourseProgress(courseId!),
    enabled: !!courseId,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    retry: 2,
  });
}

export function useCanProceedToNextChapter(chapterId?: string) {
  return useQuery({
    queryKey: ["can-proceed", chapterId],
    queryFn: () => canProceedToNextChapter(chapterId!),
    enabled: !!chapterId,
    staleTime: 1000 * 60 * 1, // Consider data fresh for 1 minute (more frequent updates)
    retry: 2,
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProgress,
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({
        queryKey: ["chapter-progress", variables.chapterId],
      });

      queryClient.invalidateQueries({
        queryKey: ["progress"],
      });

      queryClient.invalidateQueries({
        queryKey: ["can-proceed", variables.chapterId],
      });

      // Invalidate course progress if we know the course
      queryClient.invalidateQueries({
        queryKey: ["course-progress"],
      });

      console.log(`Progress updated. Chapter score: ${data.chapterScore}%`);
    },
    onError: (error: any) => {
      console.error("Failed to update progress:", error.message);

      // You might want to show a toast notification here
      if (error.message.includes("Cannot complete chapter")) {
        console.warn(
          "Chapter completion blocked due to insufficient quiz score"
        );
      }
    },
  });
}

// Custom hook to get comprehensive chapter information
export function useChapterStatus(chapterId?: string) {
  const progressQuery = useChapterProgress(chapterId);
  const canProceedQuery = useCanProceedToNextChapter(chapterId);

  return {
    // Progress data
    progress: progressQuery.data?.progress,
    calculation: progressQuery.data?.calculation,
    hasProgress: progressQuery.data?.hasProgress,

    // Can proceed data
    canProceed: canProceedQuery.data?.canProceed,

    // Combined loading state
    isLoading: progressQuery.isLoading || canProceedQuery.isLoading,

    // Combined error state
    error: progressQuery.error || canProceedQuery.error,

    // Helper computed values
    chapterScore: progressQuery.data?.calculation?.chapterScore || 0,
    isCompleted: progressQuery.data?.calculation?.isCompleted || false,
    totalQuizzes: progressQuery.data?.calculation?.totalQuizzes || 0,
    passedQuizzes: progressQuery.data?.calculation?.passedQuizzes || 0,

    // Functions to refetch
    refetch: () => {
      progressQuery.refetch();
      canProceedQuery.refetch();
    },
  };
}

// Hook specifically for course overview with all chapters
export function useCourseOverview(courseId?: string) {
  const { data, ...rest } = useCourseProgress(courseId);

  const totalChapters = data?.courseProgress?.length || 0;
  const completedChapters =
    data?.courseProgress?.filter((ch) => ch.calculation.isCompleted).length ||
    0;
  const averageScore =
    totalChapters > 0
      ? Math.round(
          data!.courseProgress.reduce(
            (sum, ch) => sum + ch.calculation.chapterScore,
            0
          ) / totalChapters
        )
      : 0;

  return {
    ...rest,
    courseProgress: data?.courseProgress || [],
    stats: {
      totalChapters,
      completedChapters,
      averageScore,
      completionPercentage:
        totalChapters > 0
          ? Math.round((completedChapters / totalChapters) * 100)
          : 0,
    },
  };
}

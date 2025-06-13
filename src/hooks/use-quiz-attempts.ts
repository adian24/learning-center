import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QuizAttempt } from "@/lib/types";
import { toast } from "sonner"; // Add this import
import { useMemo } from "react";

interface SubmitQuizAttemptData {
  quizId: string;
  answers: Array<{
    questionId: string;
    selectedOptionId?: string;
    textAnswer?: string;
  }>;
}

interface SubmitQuizAttemptResponse {
  message: string;
  attempt: QuizAttempt;
  score: number;
  passed: boolean;
}

interface UseQuizAttemptsQuery {
  quizId?: string;
  chapterId?: string;
}

async function getQuizAttempts(
  params: UseQuizAttemptsQuery
): Promise<{ attempts: QuizAttempt[] }> {
  const searchParams = new URLSearchParams();

  if (params.quizId) {
    searchParams.append("quizId", params.quizId);
  }

  if (params.chapterId) {
    searchParams.append("chapterId", params.chapterId);
  }

  const response = await fetch(
    `/api/student/quiz-attempts?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch quiz attempts");
  }

  return response.json();
}

async function submitQuizAttempt(
  data: SubmitQuizAttemptData
): Promise<SubmitQuizAttemptResponse> {
  const response = await fetch("/api/student/quiz-attempts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to submit quiz attempt");
  }

  return response.json();
}

export function useQuizAttempts(params: UseQuizAttemptsQuery = {}) {
  return useQuery({
    queryKey: ["quiz-attempts", params],
    queryFn: () => getQuizAttempts(params),
    enabled: !!(params.quizId || params.chapterId),
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    retry: 2,
  });
}

export function useSubmitQuizAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitQuizAttempt,
    onSuccess: (data, variables) => {
      // Invalidate and refetch quiz attempts
      queryClient.invalidateQueries({
        queryKey: ["quiz-attempts"],
      });

      // Invalidate chapter progress since score might have changed
      queryClient.invalidateQueries({
        queryKey: ["chapter-progress"],
      });

      // Invalidate general progress queries
      queryClient.invalidateQueries({
        queryKey: ["progress"],
      });

      // ✨ NEW: Add toast notifications
      if (data.passed) {
        toast.success(`Quiz selesai! Skor: ${data.score}% - LULUS ✅`);
      } else {
        toast.warning(`Quiz selesai! Skor: ${data.score}% - Belum Lulus ❌`);
      }

      // You can also show a success message here
      console.log(
        `Quiz completed with score: ${data.score}% (${
          data.passed ? "PASSED" : "FAILED"
        })`
      );
    },
    onError: (error) => {
      console.error("Failed to submit quiz attempt:", error);
      // ✨ NEW: Add error toast
      toast.error("Gagal mengirim jawaban quiz. Silakan coba lagi.");
    },
  });
}

// Hook to get latest attempt for a specific quiz
export function useLatestQuizAttempt(quizId?: string) {
  const { data, ...rest } = useQuizAttempts({ quizId });

  const latestAttempt = data?.attempts?.[0] || null;

  return {
    ...rest,
    latestAttempt,
    hasAttempted: !!latestAttempt,
    lastScore: latestAttempt?.score || 0,
  };
}

// Hook to get all attempts for a chapter
export function useChapterQuizAttempts(chapterId?: string) {
  return useQuizAttempts({ chapterId });
}

// ✨ NEW: Hook to check if student can retake quiz
export function useCanRetakeQuiz(quizId: string | null) {
  const { data: attempts } = useQuizAttempts({ quizId: quizId || undefined });

  const canRetake = () => {
    if (!attempts?.attempts || !quizId) return true;

    // You can implement your retake logic here
    // For example: allow unlimited retakes, or limit to 3 attempts
    const attemptCount = attempts.attempts.length;
    const maxAttempts = 3; // Configurable

    return attemptCount < maxAttempts;
  };

  const getAttemptsRemaining = () => {
    if (!attempts?.attempts || !quizId) return 3;
    const maxAttempts = 3;
    return Math.max(0, maxAttempts - attempts.attempts.length);
  };

  const getBestScore = () => {
    if (!attempts?.attempts || attempts.attempts.length === 0) return 0;
    return Math.max(...attempts.attempts.map((attempt) => attempt.score));
  };

  const getLatestAttempt = () => {
    if (!attempts?.attempts || attempts.attempts.length === 0) return null;
    return attempts.attempts[0]; // Sorted by latest first
  };

  const getAverageScore = () => {
    if (!attempts?.attempts || attempts.attempts.length === 0) return 0;
    const total = attempts.attempts.reduce(
      (sum, attempt) => sum + attempt.score,
      0
    );
    return Math.round(total / attempts.attempts.length);
  };

  return {
    canRetake: canRetake(),
    attemptsRemaining: getAttemptsRemaining(),
    bestScore: getBestScore(),
    averageScore: getAverageScore(),
    latestAttempt: getLatestAttempt(),
    totalAttempts: attempts?.attempts?.length || 0,
    maxAttempts: 3, // Make this configurable later
  };
}

// ✨ NEW: Hook for quiz statistics
export function useQuizStats(quizId: string | null) {
  const { data: attempts, isLoading } = useQuizAttempts({
    quizId: quizId || undefined,
  });

  const stats = useMemo(() => {
    if (!attempts?.attempts || attempts.attempts.length === 0) {
      return {
        totalAttempts: 0,
        bestScore: 0,
        averageScore: 0,
        lastAttemptDate: null,
        hasCompleted: false,
        hasPassed: false,
        improvement: 0, // Score improvement from first to last attempt
      };
    }

    const sortedAttempts = [...attempts.attempts].sort(
      (a, b) =>
        new Date(a.completedAt || 0).getTime() -
        new Date(b.completedAt || 0).getTime()
    );

    const scores = attempts.attempts.map((attempt) => attempt.score);
    const bestScore = Math.max(...scores);
    const averageScore = Math.round(
      scores.reduce((sum, score) => sum + score, 0) / scores.length
    );
    const firstScore = sortedAttempts[0]?.score || 0;
    const lastScore = sortedAttempts[sortedAttempts.length - 1]?.score || 0;
    const improvement = lastScore - firstScore;

    return {
      totalAttempts: attempts.attempts.length,
      bestScore,
      averageScore,
      lastAttemptDate: sortedAttempts[sortedAttempts.length - 1]?.completedAt,
      hasCompleted: attempts.attempts.length > 0,
      hasPassed: bestScore >= 60, // Assuming 60% is passing score, make this dynamic
      improvement,
    };
  }, [attempts]);

  return {
    ...stats,
    isLoading,
  };
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QuizAttempt } from "@/lib/types";

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

      // You can also show a success message here
      console.log(
        `Quiz completed with score: ${data.score}% (${
          data.passed ? "PASSED" : "FAILED"
        })`
      );
    },
    onError: (error) => {
      console.error("Failed to submit quiz attempt:", error);
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

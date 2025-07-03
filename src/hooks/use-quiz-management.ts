import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Quiz, Question, QuestionOption } from "@/lib/types";
import { QuestionType, StudentQuiz } from "@/lib/types/quiz";

interface CreateQuizData {
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore: number;
  chapterId: string;
}

interface UpdateQuizData {
  title?: string;
  description?: string;
  timeLimit?: number;
  passingScore?: number;
}

interface CreateQuestionData {
  text: string;
  type: "MULTIPLE_CHOICE" | "SINGLE_CHOICE" | "TRUE_FALSE";
  points: number;
  explanation?: string;
  quizId: string;
}

interface CreateQuestionOptionData {
  text: string;
  isCorrect: boolean;
  questionId: string;
}

// Student API functions
async function getStudentQuizzes(chapterId?: string): Promise<StudentQuiz[]> {
  const params = chapterId ? `?chapterId=${chapterId}` : "";
  const response = await fetch(`/api/student/quizzes${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch quizzes");
  }

  return response.json();
}

async function getStudentQuiz(quizId: string): Promise<StudentQuiz> {
  const response = await fetch(`/api/student/quizzes?quizId=${quizId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch quiz");
  }

  return response.json();
}

// Teacher API functions (existing)
async function getQuizzes(chapterId?: string): Promise<Quiz[]> {
  const params = chapterId ? `?chapterId=${chapterId}` : "";
  const response = await fetch(`/api/teacher/quizzes${params}`);

  if (!response.ok) {
    throw new Error("Failed to fetch quizzes");
  }

  return response.json();
}

async function getQuiz(quizId: string): Promise<Quiz> {
  const response = await fetch(`/api/teacher/quizzes/${quizId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch quiz");
  }

  return response.json();
}

async function getQuestions(chapterId?: string): Promise<Question[]> {
  const response = await fetch(`/api/teacher/questions?chapterId=${chapterId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }

  return response.json();
}

async function getQuestion(questionId?: string): Promise<Question> {
  const response = await fetch(`/api/teacher/questions/${questionId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch question");
  }

  return response.json();
}

async function createQuiz(data: CreateQuizData): Promise<Quiz> {
  const response = await fetch("/api/teacher/quizzes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create quiz");
  }

  return response.json();
}

async function updateQuiz(quizId: string, data: UpdateQuizData): Promise<Quiz> {
  const response = await fetch(`/api/teacher/quizzes/${quizId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update quiz");
  }

  return response.json();
}

async function deleteQuiz(quizId: string): Promise<void> {
  const response = await fetch(`/api/teacher/quizzes/${quizId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete quiz");
  }
}

async function createQuestion(data: CreateQuestionData): Promise<Question> {
  const response = await fetch("/api/teacher/questions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create question");
  }

  return response.json();
}

async function createQuestionOption(
  data: CreateQuestionOptionData
): Promise<QuestionOption> {
  const response = await fetch("/api/teacher/question-options", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create question option");
  }

  return response.json();
}

// Student hooks
export function useStudentQuizzes(chapterId?: string) {
  return useQuery({
    queryKey: ["student-quizzes", chapterId],
    queryFn: () => getStudentQuizzes(chapterId),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 2,
  });
}

export function useStudentQuiz(quizId?: string) {
  return useQuery({
    queryKey: ["student-quiz", quizId],
    queryFn: () => getStudentQuiz(quizId!),
    enabled: !!quizId,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

// Teacher hooks (existing, updated for clarity)
export function useQuizzes(chapterId?: string) {
  return useQuery({
    queryKey: ["teacher-quizzes", chapterId],
    queryFn: () => getQuizzes(chapterId),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 2,
    enabled: !!chapterId,
  });
}

export function useQuiz(quizId?: string) {
  return useQuery({
    queryKey: ["teacher-quiz", quizId],
    queryFn: () => getQuiz(quizId!),
    enabled: !!quizId,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}

export function useQuestions(chapterId?: string) {
  return useQuery({
    queryKey: ["teacher-questions", chapterId],
    queryFn: () => getQuestions(chapterId),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 2,
    enabled: !!chapterId,
  });
}

export function useQuestion(questionId?: string) {
  return useQuery({
    queryKey: ["teacher-question", questionId],
    queryFn: () => getQuestion(questionId),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 2,
    enabled: !!questionId,
  });
}

// Hooks for mutations (teacher only)
export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuiz,
    onSuccess: (data, variables) => {
      // Invalidate quizzes list for the chapter
      queryClient.invalidateQueries({
        queryKey: ["teacher-quizzes", variables.chapterId],
      });

      // Also invalidate student quizzes for real-time updates
      queryClient.invalidateQueries({
        queryKey: ["student-quizzes", variables.chapterId],
      });

      // Invalidate all quizzes
      queryClient.invalidateQueries({
        queryKey: ["chapter", variables.chapterId],
      });

      console.log(`Quiz "${data.title}" created successfully`);
    },
    onError: (error) => {
      console.error("Failed to create quiz:", error);
    },
  });
}

export function useUpdateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, data }: { quizId: string; data: UpdateQuizData }) =>
      updateQuiz(quizId, data),
    onSuccess: (data, variables) => {
      // Invalidate specific quiz
      queryClient.invalidateQueries({
        queryKey: ["teacher-quiz", variables.quizId],
      });

      queryClient.invalidateQueries({
        queryKey: ["student-quiz", variables.quizId],
      });

      // Invalidate quizzes list
      queryClient.invalidateQueries({
        queryKey: ["teacher-quizzes"],
      });

      queryClient.invalidateQueries({
        queryKey: ["student-quizzes"],
      });

      console.log(`Quiz "${data.title}" updated successfully`);
    },
    onError: (error) => {
      console.error("Failed to update quiz:", error);
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteQuiz,
    onSuccess: (_, quizId) => {
      // Invalidate specific quiz
      queryClient.invalidateQueries({
        queryKey: ["teacher-quiz", quizId],
      });

      queryClient.invalidateQueries({
        queryKey: ["student-quiz", quizId],
      });

      // Invalidate all quizzes
      queryClient.invalidateQueries({
        queryKey: ["teacher-quizzes"],
      });

      queryClient.invalidateQueries({
        queryKey: ["student-quizzes"],
      });

      console.log("Quiz deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete quiz:", error);
    },
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuestion,
    onSuccess: (data, variables) => {
      // Invalidate the quiz to refetch questions
      queryClient.invalidateQueries({
        queryKey: ["teacher-quiz", variables.quizId],
      });

      queryClient.invalidateQueries({
        queryKey: ["student-quiz", variables.quizId],
      });

      // Invalidate quizzes list to update question count
      queryClient.invalidateQueries({
        queryKey: ["teacher-quizzes"],
      });

      queryClient.invalidateQueries({
        queryKey: ["student-quizzes"],
      });

      console.log(`Question created successfully`);
    },
    onError: (error) => {
      console.error("Failed to create question:", error);
    },
  });
}

export function useCreateQuestionOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuestionOption,
    onSuccess: (data, variables) => {
      // Invalidate the quiz to refetch questions with options
      queryClient.invalidateQueries({
        queryKey: ["teacher-quiz"],
      });

      queryClient.invalidateQueries({
        queryKey: ["student-quiz"],
      });

      console.log(`Question option created successfully`);
    },
    onError: (error) => {
      console.error("Failed to create question option:", error);
    },
  });
}

// Update Question
export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionId,
      data,
    }: {
      questionId: string;
      data: {
        text: string;
        type: QuestionType;
        points: number;
        explanation?: string;
      };
    }) => {
      const response = await fetch(`/api/teacher/questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update question");
      }

      return response.json();
    },
    onSuccess: (_, { questionId }) => {
      // Invalidate quiz queries to refresh the question list
      queryClient.invalidateQueries({ queryKey: ["teacher-quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-questions"] });
    },
  });
}

// Update Question Option
export function useUpdateQuestionOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      optionId,
      data,
    }: {
      optionId: string;
      data: {
        text: string;
        isCorrect: boolean;
      };
    }) => {
      const response = await fetch(
        `/api/teacher/question-options/${optionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update option");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-questions"] });
    },
  });
}

// Delete Question Option
export function useDeleteQuestionOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ optionId }: { optionId: string }) => {
      const response = await fetch(
        `/api/teacher/question-options/${optionId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete option");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-questions"] });
    },
  });
}

// Delete Question
export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId }: { questionId: string }) => {
      const response = await fetch(`/api/teacher/questions/${questionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete question");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-questions"] });
    },
  });
}

// Custom hook for comprehensive quiz management (teacher)
export function useQuizBuilder(chapterId?: string) {
  const quizzesQuery = useQuizzes(chapterId);
  const createQuizMutation = useCreateQuiz();
  const createQuestionMutation = useCreateQuestion();
  const createOptionMutation = useCreateQuestionOption();

  return {
    // Data
    quizzes: quizzesQuery.data || [],
    isLoading: quizzesQuery.isLoading,
    error: quizzesQuery.error,

    // Actions
    createQuiz: createQuizMutation.mutateAsync,
    createQuestion: createQuestionMutation.mutateAsync,
    createOption: createOptionMutation.mutateAsync,

    // States
    isCreatingQuiz: createQuizMutation.isPending,
    isCreatingQuestion: createQuestionMutation.isPending,
    isCreatingOption: createOptionMutation.isPending,

    // Helpers
    refetch: quizzesQuery.refetch,

    // Computed values
    quizCount: quizzesQuery.data?.length || 0,
    maxQuizzesReached: (quizzesQuery.data?.length || 0) >= 30, // Max 30 quizzes per chapter
  };
}

import { useQuery } from "@tanstack/react-query";

interface QuizQuestion {
  id: string;
  text: string;
  type: "MULTIPLE_CHOICE" | "SINGLE_CHOICE" | "TRUE_FALSE" | "TEXT" | "NUMBER";
  points: number;
  explanation?: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
}

interface StudentQuiz {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore: number;
  questions: QuizQuestion[];
  chapter: {
    id: string;
    title: string;
    isFree: boolean;
    course: {
      id: string;
      title: string;
    };
  };
}

// Get specific quiz for student to take
export const useStudentQuiz = (quizId: string | null) => {
  return useQuery<StudentQuiz>({
    queryKey: ["student-quiz", quizId],
    queryFn: async () => {
      if (!quizId) throw new Error("Quiz ID is required");

      const response = await fetch(`/api/student/quizzes?quizId=${quizId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch quiz");
      }

      return response.json();
    },
    enabled: !!quizId,
    staleTime: 300000, // 5 minutes
    retry: 2,
  });
};

// Get all quizzes for a chapter
export const useChapterQuizzes = (chapterId: string | null) => {
  return useQuery<StudentQuiz[]>({
    queryKey: ["chapter-quizzes", chapterId],
    queryFn: async () => {
      if (!chapterId) throw new Error("Chapter ID is required");

      const response = await fetch(
        `/api/student/quizzes?chapterId=${chapterId}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch chapter quizzes");
      }

      return response.json();
    },
    enabled: !!chapterId,
    staleTime: 300000, // 5 minutes
  });
};

// Helper hook to check quiz access
export const useQuizAccess = (quiz: StudentQuiz | null) => {
  if (!quiz) return { hasAccess: false, reason: "Quiz not found" };

  const hasAccess = quiz.chapter.isFree || quiz.chapter.course;
  const reason = hasAccess
    ? null
    : "You need to enroll in this course to access this quiz";

  return { hasAccess, reason };
};

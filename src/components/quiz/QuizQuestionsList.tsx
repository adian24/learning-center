"use client";

import React, { memo } from "react";
import { useQuestionsByQuiz } from "@/hooks/use-quiz-management";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import QuestionItem from "./questions/QuestionItem";

interface QuizQuestionsListProps {
  quizId: string;
  chapterId: string;
}

const QuizQuestionsList: React.FC<QuizQuestionsListProps> = memo(({
  quizId,
  chapterId,
}) => {
  const { data: questions, isLoading, error } = useQuestionsByQuiz(quizId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load questions</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {questions?.map((question, qIndex) => (
        <QuestionItem
          key={question.id}
          question={question}
          qIndex={qIndex}
        />
      )) || []}
    </div>
  );
});

QuizQuestionsList.displayName = "QuizQuestionsList";

export default QuizQuestionsList;
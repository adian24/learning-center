"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  Clock,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Trophy,
  AlertCircle,
} from "lucide-react";
import { Quiz, QuestionOption } from "@/lib/types";
import {
  useSubmitQuizAttempt,
  useLatestQuizAttempt,
} from "@/hooks/use-quiz-attempts";

interface QuizInterfaceProps {
  quiz: Quiz;
  onQuizComplete?: (score: number, passed: boolean) => void;
}

interface Answer {
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({
  quiz,
  onQuizComplete,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);

  const submitQuizMutation = useSubmitQuizAttempt();
  const { latestAttempt, hasAttempted, lastScore } = useLatestQuizAttempt(
    quiz.id
  );

  const currentQuestion = quiz.questions?.[currentQuestionIndex];
  const totalQuestions = quiz.questions?.length || 0;
  const progress =
    totalQuestions > 0
      ? ((currentQuestionIndex + 1) / totalQuestions) * 100
      : 0;

  // Initialize quiz
  useEffect(() => {
    if (!quizStartTime) {
      setQuizStartTime(new Date());
      if (quiz.timeLimit) {
        setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds
      }
    }
  }, [quiz.timeLimit, quizStartTime]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !quizCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev && prev <= 1) {
            handleSubmitQuiz(); // Auto-submit when time runs out
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, quizCompleted]);

  const handleAnswerChange = (
    questionId: string,
    value: string,
    type: "option" | "text"
  ) => {
    setAnswers((prev) => {
      const existingIndex = prev.findIndex((a) => a.questionId === questionId);
      const newAnswer: Answer = {
        questionId,
        ...(type === "option"
          ? { selectedOptionId: value }
          : { textAnswer: value }),
      };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newAnswer;
        return updated;
      } else {
        return [...prev, newAnswer];
      }
    });
  };

  const getCurrentAnswer = (questionId: string): Answer | undefined => {
    return answers.find((a) => a.questionId === questionId);
  };

  const isQuestionAnswered = (questionId: string): boolean => {
    const answer = getCurrentAnswer(questionId);
    return !!(answer?.selectedOptionId || answer?.textAnswer?.trim());
  };

  const canProceedToNext = (): boolean => {
    return currentQuestion ? isQuestionAnswered(currentQuestion.id) : false;
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting || quizCompleted) return;

    setIsSubmitting(true);
    try {
      const result = await submitQuizMutation.mutateAsync({
        quizId: quiz.id,
        answers: answers,
      });

      setQuizResult({ score: result.score, passed: result.passed });
      setQuizCompleted(true);
      onQuizComplete?.(result.score, result.passed);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setQuizCompleted(false);
    setQuizResult(null);
    setQuizStartTime(new Date());
    if (quiz.timeLimit) {
      setTimeRemaining(quiz.timeLimit * 60);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getAnsweredQuestionsCount = (): number => {
    return quiz.questions?.filter((q) => isQuestionAnswered(q.id)).length || 0;
  };

  // Quiz completion view
  if (quizCompleted && quizResult) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {quizResult.passed ? (
              <Trophy className="h-16 w-16 text-yellow-500" />
            ) : (
              <RotateCcw className="h-16 w-16 text-orange-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {quizResult.passed ? "Selamat! Quiz Berhasil" : "Quiz Selesai"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold">
              <span
                className={
                  quizResult.passed ? "text-green-600" : "text-orange-600"
                }
              >
                {quizResult.score}%
              </span>
            </div>

            <Badge
              variant={quizResult.passed ? "default" : "secondary"}
              className="text-lg px-4 py-2"
            >
              {quizResult.passed ? "LULUS" : "BELUM LULUS"}
            </Badge>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-semibold">
                  {quizResult.score}%
                </div>
                <div className="text-sm text-muted-foreground">Skor Anda</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">
                  {quiz.passingScore}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Minimum Lulus
                </div>
              </div>
            </div>

            {quizResult.passed ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Selamat! Anda telah berhasil menyelesaikan quiz ini dengan
                  skor di atas passing grade.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Skor Anda belum mencapai passing grade ({quiz.passingScore}%).
                  Anda dapat mengulang quiz ini untuk meningkatkan skor.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {!quizResult.passed && (
            <div className="flex justify-center">
              <Button onClick={handleRetakeQuiz} size="lg">
                <RotateCcw className="h-4 w-4 mr-2" />
                Ulangi Quiz
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Previous attempt info
  if (hasAttempted && !quizCompleted) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Quiz: {quiz.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Anda sudah pernah mengerjakan quiz ini dengan skor {lastScore}%.
              {lastScore >= quiz.passingScore
                ? " Quiz ini sudah lulus!"
                : " Anda bisa mengulang untuk meningkatkan skor."}
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button onClick={handleRetakeQuiz} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Ulangi Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quiz taking interface
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{quiz.title}</CardTitle>
            {quiz.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {quiz.description}
              </p>
            )}
          </div>
          <div className="text-right space-y-2">
            {timeRemaining !== null && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span
                  className={`font-mono ${
                    timeRemaining < 300 ? "text-red-500" : ""
                  }`}
                >
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
            <Badge variant="outline">Passing Grade: {quiz.passingScore}%</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              Pertanyaan {currentQuestionIndex + 1} dari {totalQuestions}
            </span>
            <span>
              Terjawab: {getAnsweredQuestionsCount()}/{totalQuestions}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Question */}
        {currentQuestion && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{currentQuestion.text}</h3>
              {currentQuestion.points > 1 && (
                <Badge variant="secondary">{currentQuestion.points} poin</Badge>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.type === "MULTIPLE_CHOICE" ||
              currentQuestion.type === "SINGLE_CHOICE" ||
              currentQuestion.type === "TRUE_FALSE" ? (
                <RadioGroup
                  value={
                    getCurrentAnswer(currentQuestion.id)?.selectedOptionId || ""
                  }
                  onValueChange={(value) =>
                    handleAnswerChange(currentQuestion.id, value, "option")
                  }
                >
                  {currentQuestion.options?.map((option: QuestionOption) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label
                        htmlFor={option.id}
                        className="flex-1 cursor-pointer"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : null}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Sebelumnya
          </Button>

          <div className="flex gap-2">
            {currentQuestionIndex < totalQuestions - 1 ? (
              <Button
                onClick={handleNextQuestion}
                disabled={!canProceedToNext()}
              >
                Selanjutnya
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmitQuiz}
                disabled={!canProceedToNext() || isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Mengirim..." : "Selesai Quiz"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizInterface;

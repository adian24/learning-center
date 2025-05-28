"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  BarChart3,
  Eye,
  AlertCircle,
} from "lucide-react";
import { Quiz, QuizAttempt } from "@/lib/types";
import { useStudentQuizzes } from "@/hooks/use-quiz-management";
import { useChapterQuizAttempts } from "@/hooks/use-quiz-attempts";
import QuizInterface from "./QuizInterface";

interface QuizListProps {
  chapterId: string;
  onQuizComplete?: () => void;
}

interface QuizWithAttempt extends Quiz {
  latestAttempt?: QuizAttempt;
  bestScore?: number;
  attemptCount?: number;
  isPassed?: boolean;
}

const QuizList: React.FC<QuizListProps> = ({ chapterId, onQuizComplete }) => {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "taking">("list");

  const { data: quizzes, isLoading: quizzesLoading } =
    useStudentQuizzes(chapterId);
  const { data: attempts, isLoading: attemptsLoading } =
    useChapterQuizAttempts(chapterId);

  const isLoading = quizzesLoading || attemptsLoading;

  // Combine quiz data with attempt history
  const quizzesWithAttempts: QuizWithAttempt[] = React.useMemo(() => {
    if (!quizzes || !attempts) return [];

    return quizzes.map((quiz) => {
      const quizAttempts = attempts.attempts.filter(
        (attempt) => attempt.quiz.id === quiz.id
      );
      const latestAttempt = quizAttempts[0]; // Already sorted by startedAt desc
      const bestScore =
        quizAttempts.length > 0
          ? Math.max(...quizAttempts.map((a) => a.score))
          : undefined;
      const isPassed =
        bestScore !== undefined && bestScore >= quiz.passingScore;

      return {
        ...quiz,
        latestAttempt,
        bestScore,
        attemptCount: quizAttempts.length,
        isPassed,
      };
    });
  }, [quizzes, attempts]);

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setViewMode("taking");
  };

  const handleQuizComplete = (score: number, passed: boolean) => {
    setViewMode("list");
    setSelectedQuiz(null);
    onQuizComplete?.();
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedQuiz(null);
  };

  const getQuizStatusIcon = (quiz: QuizWithAttempt) => {
    if (quiz.isPassed) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (quiz.attemptCount && quiz.attemptCount > 0) {
      return <XCircle className="h-5 w-5 text-orange-500" />;
    } else {
      return <Play className="h-5 w-5 text-blue-500" />;
    }
  };

  const getQuizStatusBadge = (quiz: QuizWithAttempt) => {
    if (quiz.isPassed) {
      return <Badge className="bg-green-100 text-green-800">Lulus</Badge>;
    } else if (quiz.attemptCount && quiz.attemptCount > 0) {
      return <Badge variant="secondary">Belum Lulus</Badge>;
    } else {
      return <Badge variant="outline">Belum Dikerjakan</Badge>;
    }
  };

  const calculateOverallChapterScore = (): number => {
    if (quizzesWithAttempts.length === 0) return 100;

    const passedQuizzes = quizzesWithAttempts.filter((q) => q.isPassed).length;
    return Math.round((passedQuizzes / quizzesWithAttempts.length) * 100);
  };

  const overallScore = calculateOverallChapterScore();
  const isChapterPassed = overallScore >= 65;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                Memuat quiz...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === "taking" && selectedQuiz) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={handleBackToList}>
          ← Kembali ke Daftar Quiz
        </Button>
        <QuizInterface
          quiz={selectedQuiz}
          onQuizComplete={handleQuizComplete}
        />
      </div>
    );
  }

  if (!quizzesWithAttempts.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Belum Ada Quiz</h3>
              <p className="text-sm text-muted-foreground">
                Chapter ini belum memiliki quiz. Silakan lanjutkan dengan materi
                lainnya.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chapter Quiz Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <CardTitle>Ringkasan Quiz Chapter</CardTitle>
            </div>
            <Badge variant={isChapterPassed ? "default" : "secondary"}>
              {overallScore}% ({isChapterPassed ? "Lulus" : "Belum Lulus"})
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress Quiz Chapter</span>
              <span>
                {quizzesWithAttempts.filter((q) => q.isPassed).length}/
                {quizzesWithAttempts.length} Quiz Lulus
              </span>
            </div>
            <Progress value={overallScore} className="w-full" />
          </div>

          {isChapterPassed ? (
            <Alert>
              <Trophy className="h-4 w-4" />
              <AlertDescription>
                Selamat! Anda telah menyelesaikan semua quiz di chapter ini
                dengan skor {overallScore}%. Anda dapat melanjutkan ke chapter
                berikutnya.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Anda perlu menyelesaikan lebih banyak quiz untuk mencapai skor
                minimal 65% agar dapat melanjutkan ke chapter berikutnya.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Quiz List */}
      <div className="space-y-4">
        {quizzesWithAttempts.map((quiz, index) => (
          <Card key={quiz.id} className="relative">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    {getQuizStatusIcon(quiz)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          Quiz {index + 1}: {quiz.title}
                        </h3>
                        {getQuizStatusBadge(quiz)}
                      </div>
                      {quiz.description && (
                        <p className="text-sm text-muted-foreground">
                          {quiz.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quiz Details */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      <span>Passing Grade: {quiz.passingScore}%</span>
                    </div>
                    {quiz.timeLimit && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Waktu: {quiz.timeLimit} menit</span>
                      </div>
                    )}
                    {quiz.questions && (
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{quiz.questions.length} soal</span>
                      </div>
                    )}
                  </div>

                  {/* Attempt History */}
                  {quiz.attemptCount && quiz.attemptCount > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">
                        Riwayat Percobaan:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          Percobaan: {quiz.attemptCount}x
                        </Badge>
                        <Badge variant="outline">
                          Skor Terbaik: {quiz.bestScore}%
                        </Badge>
                        {quiz.latestAttempt && (
                          <Badge variant="outline">
                            Terakhir: {quiz.latestAttempt.score}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="ml-4">
                  <Button
                    onClick={() => handleStartQuiz(quiz)}
                    variant={quiz.isPassed ? "outline" : "default"}
                    size="sm"
                  >
                    {quiz.isPassed
                      ? "Ulangi Quiz"
                      : quiz.attemptCount && quiz.attemptCount > 0
                      ? "Coba Lagi"
                      : "Mulai Quiz"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuizList;

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStudentQuizzes } from "@/hooks/use-quiz-management";
import { StudentQuiz } from "@/lib/types/quiz";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import {
  CheckCircle,
  Clock,
  Trophy,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import React, { useState } from "react";
import QuizDrawer from "./QuizDrawer";

interface StudentQuizzesProps {
  chapterId: string;
  courseData?: any;
  chapters?: any[];
}

// Quiz Carousel Component
interface QuizCarouselProps {
  quizzes: StudentQuiz[];
  onOpenQuiz: (quizId: string) => void;
}

const QuizCarousel: React.FC<QuizCarouselProps> = ({ quizzes, onOpenQuiz }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? quizzes.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === quizzes.length - 1 ? 0 : prev + 1));
  };

  const quiz = quizzes[currentIndex];
  const attemptData = quiz._attemptData;
  const hasPassed = attemptData?.hasPassed || false;
  const bestScore = attemptData?.bestScore || 0;
  const hasAttempted = attemptData?.hasAttempted || false;
  const canRetake = attemptData?.canRetake ?? true;
  const attemptsRemaining = attemptData?.attemptsRemaining || 3;

  return (
    <div className="relative">
      {/* Quiz Content */}
      <div className="space-y-2 p-3 border rounded-lg bg-card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">{quiz.title}</h4>
              {hasPassed && (
                <Badge
                  variant="outline"
                  className="text-xs bg-green-50 text-green-700 border-green-200"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Lulus
                </Badge>
              )}
            </div>
            {quiz.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {quiz.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {quiz.questions?.length || 0} soal
              </span>
              {quiz.timeLimit && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {quiz.timeLimit} menit
                </span>
              )}
              {hasAttempted && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  Skor Terbaik: {bestScore}%
                </span>
              )}
            </div>
          </div>
        </div>

        {hasPassed ? (
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-green-600 font-medium">
              ✅ Selesai
            </span>
            {canRetake && attemptsRemaining > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => onOpenQuiz(quiz.id)}
              >
                Coba Lagi ({attemptsRemaining} kesempatan)
              </Button>
            )}
          </div>
        ) : (
          <Button
            size="sm"
            className="w-full mt-2"
            variant={hasAttempted ? "secondary" : "default"}
            onClick={() => onOpenQuiz(quiz.id)}
            disabled={!canRetake}
          >
            {hasAttempted
              ? `Coba Lagi (${attemptsRemaining} kesempatan)`
              : "Ikuti Kuis"}
          </Button>
        )}
      </div>

      <div className="mt-2 flex items-center justify-around w-full">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-background shadow-md hover:bg-accent"
          onClick={handlePrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Carousel Indicators */}
        <div>
          <div className="flex justify-center gap-1 mt-3">
            {quizzes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? "w-6 bg-primary"
                    : "w-1.5 bg-muted-foreground/30"
                }`}
                aria-label={`Go to quiz ${index + 1}`}
              />
            ))}
          </div>

          {/* Quiz Counter */}
          <p className="text-center text-xs text-muted-foreground mt-2">
            Kuis {currentIndex + 1} dari {quizzes.length}
          </p>
        </div>

        {/* Navigation Buttons */}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-background shadow-md hover:bg-accent"
          onClick={handleNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const StudentQuizzes = ({ chapterId, courseData, chapters }: StudentQuizzesProps) => {
  const { data: quizzes, isLoading } = useStudentQuizzes(chapterId);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const quizPassed = quizzes?.filter(
    (quiz) => quiz._attemptData?.hasPassed
  ).length;

  const handleOpenQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedQuizId(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ChatBubbleIcon className="h-4 w-4" />
            Kuis Chapter
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ChatBubbleIcon className="h-4 w-4" />
            Kuis Chapter ({quizPassed}/{quizzes?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {!quizzes || quizzes.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Belum ada kuis untuk chapter ini
              </div>
            ) : quizzes.length === 1 ? (
              // Single quiz - display normally
              (() => {
                const quiz = quizzes[0];
                const attemptData = quiz._attemptData;
                const hasPassed = attemptData?.hasPassed || false;
                const bestScore = attemptData?.bestScore || 0;
                const hasAttempted = attemptData?.hasAttempted || false;
                const canRetake = attemptData?.canRetake ?? true;
                const attemptsRemaining = attemptData?.attemptsRemaining || 3;

                return (
                  <div className="space-y-2 border p-3 rounded-lg bg-card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium">{quiz.title}</h4>
                          {hasPassed && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-green-50 text-green-700 border-green-200"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Lulus
                            </Badge>
                          )}
                        </div>
                        {quiz.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {quiz.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {quiz.questions?.length || 0} soal
                          </span>
                          {quiz.timeLimit && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {quiz.timeLimit} menit
                            </span>
                          )}
                          {hasAttempted && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              Skor Terbaik: {bestScore}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {hasPassed ? (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-green-600 font-medium">
                          ✅ Selesai
                        </span>
                        {canRetake && attemptsRemaining > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs"
                            onClick={() => handleOpenQuiz(quiz.id)}
                          >
                            Coba Lagi ({attemptsRemaining} kesempatan)
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        variant={hasAttempted ? "secondary" : "default"}
                        onClick={() => handleOpenQuiz(quiz.id)}
                        disabled={!canRetake}
                      >
                        {hasAttempted
                          ? `Coba Lagi (${attemptsRemaining} kesempatan)`
                          : "Ikuti Kuis"}
                      </Button>
                    )}
                  </div>
                );
              })()
            ) : (
              // Multiple quizzes - display as carousel
              <QuizCarousel quizzes={quizzes} onOpenQuiz={handleOpenQuiz} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quiz Drawer */}
      {selectedQuizId && (
        <QuizDrawer
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          quizId={selectedQuizId}
          chapterId={chapterId}
          courseData={courseData}
          chapters={chapters}
        />
      )}
    </>
  );
};

export default StudentQuizzes;

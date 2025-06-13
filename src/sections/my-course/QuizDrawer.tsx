import React, { useState, useEffect, useCallback } from "react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Trophy,
  X,
  XCircle,
} from "lucide-react";
import { useStudentQuiz } from "@/hooks/use-quiz-management";
import {
  useSubmitQuizAttempt,
  useCanRetakeQuiz,
} from "@/hooks/use-quiz-attempts";
import { QuizAnswer } from "@/lib/types/quiz";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

interface QuizDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: string;
  chapterId: string;
}

const QuizDrawer: React.FC<QuizDrawerProps> = ({
  isOpen,
  onClose,
  quizId,
  chapterId,
}) => {
  const { data: quizData, isLoading: quizLoading } = useStudentQuiz(quizId);
  const { canRetake, attemptsRemaining, bestScore } = useCanRetakeQuiz(quizId);
  const submitQuizAttempt = useSubmitQuizAttempt();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);

  const currentQuestion = quizData?.questions[currentQuestionIndex];
  const totalQuestions = quizData?.questions.length || 0;
  const answeredQuestions = Object.keys(answers).length;

  useEffect(() => {
    if (!quizStarted || !quizData?.timeLimit || timeRemaining === null) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizStarted, timeRemaining]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartQuiz = () => {
    if (!canRetake) {
      toast.error(
        "Anda sudah mencapai batas maksimal percobaan untuk kuis ini"
      );
      return;
    }
    setQuizStarted(true);
    if (quizData?.timeLimit) setTimeRemaining(quizData.timeLimit * 60);
    toast.info("Kuis dimulai! Semoga berhasil 🎯");
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0)
      setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1)
      setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    if (!currentQuestion) return;
    const answer: QuizAnswer = { questionId };
    switch (currentQuestion.type) {
      case "SINGLE_CHOICE":
      case "TRUE_FALSE":
        answer.selectedOptionId = value as string;
        break;
      case "MULTIPLE_CHOICE":
        answer.selectedOptionIds = value as string[];
        break;
      case "TEXT":
      case "NUMBER":
        answer.textAnswer = value as string;
        break;
    }
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmitQuiz = useCallback(async () => {
    if (!quizData) return;
    const answersArray = Object.values(answers);
    if (answersArray.length < totalQuestions) {
      toast.warning("Harap jawab semua pertanyaan sebelum submit");
      return;
    }
    try {
      toast.loading("Mengirim jawaban...");
      const result = await submitQuizAttempt.mutateAsync({
        quizId: quizData.id,
        answers: answersArray.map((answer) => ({
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          textAnswer: answer.textAnswer,
        })),
      });
      toast.dismiss();
      setQuizResult({ score: result.score, passed: result.passed });
      setShowResults(true);
    } catch (error) {
      toast.dismiss();
      toast.error("Gagal mengirim jawaban. Silakan coba lagi.");
      console.error("Submit quiz error:", error);
    }
  }, [quizData, answers, totalQuestions, submitQuizAttempt]);

  const handleClose = () => {
    if (quizStarted && !showResults) {
      toast.warning(
        "Kuis sedang berlangsung. Harap selesaikan terlebih dahulu."
      );
      return;
    }
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(null);
    setQuizStarted(false);
    setShowResults(false);
    setQuizResult(null);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DrawerContent className="h-screen max-w-xl ml-auto w-full p-0">
        <DrawerTitle className="text-2xl font-bold px-6"></DrawerTitle>

        {!quizStarted ? (
          // Quiz intro
          <div className="h-full flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">{quizData?.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {quizData?.description}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Soal
                    </span>
                    <Badge variant="outline">{totalQuestions} soal</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Waktu</span>
                    <Badge variant="outline">
                      {quizData?.timeLimit
                        ? `${quizData.timeLimit} menit`
                        : "Tidak dibatasi"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Passing Score
                    </span>
                    <Badge variant="outline">{quizData?.passingScore}%</Badge>
                  </div>
                  {bestScore > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Skor Terbaik
                      </span>
                      <Badge variant="secondary">{bestScore}%</Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Kesempatan Tersisa
                    </span>
                    <Badge
                      variant={
                        attemptsRemaining > 1 ? "default" : "destructive"
                      }
                    >
                      {attemptsRemaining} kali
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Pastikan Anda siap sebelum memulai. Setelah dimulai, Anda
                  tidak dapat menghentikan kuis.
                </AlertDescription>
              </Alert>

              {totalQuestions === 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Tidak ada soal untuk kuis ini.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handleStartQuiz}
                disabled={!canRetake || totalQuestions === 0}
                className="flex-1"
              >
                Mulai Kuis
              </Button>
            </div>
          </div>
        ) : showResults ? (
          // Quiz results
          <div className="h-full flex flex-col p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Hasil Kuis</h2>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-6">
              <div className="text-center space-y-4">
                {quizResult?.passed ? (
                  <>
                    <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                      <Trophy className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-600">
                      Selamat! Anda Lulus
                    </h3>
                  </>
                ) : (
                  <>
                    <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-red-600">
                      Belum Lulus
                    </h3>
                  </>
                )}

                <div className="text-4xl font-bold">{quizResult?.score}%</div>

                <Card>
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Skor Anda
                      </span>
                      <span className="font-semibold">
                        {quizResult?.score}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Passing Score
                      </span>
                      <span className="font-semibold">
                        {quizData?.passingScore}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status
                      </span>
                      <Badge
                        variant={quizResult?.passed ? "default" : "destructive"}
                      >
                        {quizResult?.passed ? "LULUS" : "TIDAK LULUS"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {!quizResult?.passed && attemptsRemaining > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Anda masih memiliki {attemptsRemaining} kesempatan untuk
                      mencoba lagi.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              Tutup
            </Button>
          </div>
        ) : (
          // Quiz questions
          <div className="h-full flex flex-col p-6">
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Soal {currentQuestionIndex + 1} dari {totalQuestions}
                </h2>
                {timeRemaining !== null && (
                  <Badge
                    variant={timeRemaining < 60 ? "destructive" : "default"}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTime(timeRemaining)}
                  </Badge>
                )}
              </div>
              <Progress
                value={((currentQuestionIndex + 1) / totalQuestions) * 100}
              />
            </div>

            <div className="flex-1 overflow-y-auto mb-6">
              {currentQuestion && (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <p className="text-base font-medium flex-1">
                            {currentQuestion.text}
                          </p>
                          <Badge variant="outline" className="ml-2">
                            {currentQuestion.points} poin
                          </Badge>
                        </div>

                        {/* Render answer options based on question type */}
                        {(currentQuestion.type === "SINGLE_CHOICE" ||
                          currentQuestion.type === "TRUE_FALSE") && (
                          <div className="space-y-3">
                            {currentQuestion.options.map((option) => (
                              <label
                                key={option.id}
                                className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-accent"
                              >
                                <input
                                  type="radio"
                                  name={`question-${currentQuestion.id}`}
                                  value={option.id}
                                  checked={
                                    answers[currentQuestion.id]
                                      ?.selectedOptionId === option.id
                                  }
                                  onChange={() =>
                                    handleAnswerChange(
                                      currentQuestion.id,
                                      option.id
                                    )
                                  }
                                  className="w-4 h-4"
                                />
                                <span className="flex-1">{option.text}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {currentQuestion.type === "MULTIPLE_CHOICE" && (
                          <div className="space-y-3">
                            {currentQuestion.options.map((option) => {
                              const selectedIds = (answers[currentQuestion.id]
                                ?.selectedOptionIds || []) as string[];
                              const isChecked = selectedIds.includes(option.id);

                              return (
                                <label
                                  key={option.id}
                                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-accent"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const newSelectedIds = e.target.checked
                                        ? [...selectedIds, option.id]
                                        : selectedIds.filter(
                                            (id) => id !== option.id
                                          );
                                      handleAnswerChange(
                                        currentQuestion.id,
                                        newSelectedIds
                                      );
                                    }}
                                    className="w-4 h-4"
                                  />
                                  <span className="flex-1">{option.text}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {currentQuestion.type === "TEXT" && (
                          <Textarea
                            placeholder="Tulis jawaban Anda di sini..."
                            value={
                              answers[currentQuestion.id]?.textAnswer || ""
                            }
                            onChange={(e) =>
                              handleAnswerChange(
                                currentQuestion.id,
                                e.target.value
                              )
                            }
                            rows={4}
                          />
                        )}

                        {currentQuestion.type === "NUMBER" && (
                          <Input
                            type="number"
                            placeholder="Masukkan angka"
                            value={
                              answers[currentQuestion.id]?.textAnswer || ""
                            }
                            onChange={(e) =>
                              handleAnswerChange(
                                currentQuestion.id,
                                e.target.value
                              )
                            }
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Question navigation indicator */}
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                    {quizData?.questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                          index === currentQuestionIndex
                            ? "bg-primary text-primary-foreground"
                            : answers[quizData?.questions[index].id]
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Sebelumnya
              </Button>

              {currentQuestionIndex === totalQuestions - 1 ? (
                <Button
                  onClick={() => setShowConfirmSubmit(true)}
                  disabled={answeredQuestions < totalQuestions}
                  className="flex-1"
                >
                  Submit Kuis
                </Button>
              ) : (
                <Button onClick={handleNext} className="flex-1">
                  Selanjutnya
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        )}
      </DrawerContent>

      <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <DialogContent className="sm:max-w-[750px]">
          <DialogHeader>
            <DialogTitle>Konfirmasi Submit</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mengumpulkan jawaban? Anda tidak dapat
              mengubah jawaban setelah submit.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmSubmit(false)}
            >
              Batal
            </Button>
            <Button
              onClick={() => {
                setShowConfirmSubmit(false);
                handleSubmitQuiz();
              }}
              disabled={submitQuizAttempt.isPending}
            >
              {submitQuizAttempt.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                "Ya, Submit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Drawer>
  );
};

export default QuizDrawer;

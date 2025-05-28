"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Trophy,
  BarChart3,
  PlayCircle,
  Lock,
  AlertCircle,
} from "lucide-react";
import { useChapterStatus } from "@/hooks/use-chapter-progress";
import { useUpdateProgress } from "@/hooks/use-chapter-progress";

interface ChapterProgressProps {
  chapterId: string;
  onProgressUpdate?: () => void;
}

const ChapterProgress: React.FC<ChapterProgressProps> = ({
  chapterId,
  onProgressUpdate,
}) => {
  const {
    progress,
    calculation,
    canProceed,
    chapterScore,
    isCompleted,
    totalQuizzes,
    passedQuizzes,
    isLoading,
    error,
  } = useChapterStatus(chapterId);

  const updateProgressMutation = useUpdateProgress();

  const handleMarkComplete = async () => {
    try {
      await updateProgressMutation.mutateAsync({
        chapterId,
        isCompleted: true,
      });
      onProgressUpdate?.();
    } catch (error: any) {
      console.error("Failed to mark chapter as complete:", error.message);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">
                Memuat progress...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Gagal memuat data progress. Silakan coba lagi.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getProgressIcon = () => {
    if (isCompleted) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    } else if (chapterScore >= 65) {
      return <Trophy className="h-6 w-6 text-yellow-500" />;
    } else if (totalQuizzes > 0) {
      return <BarChart3 className="h-6 w-6 text-blue-500" />;
    } else {
      return <PlayCircle className="h-6 w-6 text-gray-500" />;
    }
  };

  const getProgressStatus = () => {
    if (isCompleted) {
      return "Selesai";
    } else if (chapterScore >= 65) {
      return "Dapat Dilanjutkan";
    } else if (totalQuizzes > 0) {
      return "Perlu Menyelesaikan Quiz";
    } else {
      return "Dalam Progress";
    }
  };

  const getProgressBadge = () => {
    if (isCompleted) {
      return <Badge className="bg-green-100 text-green-800">Selesai</Badge>;
    } else if (chapterScore >= 65) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          Dapat Dilanjutkan
        </Badge>
      );
    } else if (totalQuizzes > 0) {
      return <Badge variant="secondary">Perlu Quiz</Badge>;
    } else {
      return <Badge variant="outline">Dalam Progress</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Progress Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getProgressIcon()}
              <div>
                <CardTitle>Progress Chapter</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {getProgressStatus()}
                </p>
              </div>
            </div>
            {getProgressBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Progress */}
          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Video Progress</span>
                <span>
                  {Math.round((progress.watchedSeconds / 3600) * 100)}% watched
                </span>
              </div>
              <Progress
                value={Math.round((progress.watchedSeconds / 3600) * 100)}
                className="w-full"
              />
            </div>
          )}

          {/* Quiz Progress */}
          {totalQuizzes > 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Quiz Progress</span>
                  <span>
                    {passedQuizzes}/{totalQuizzes} Quiz Lulus
                  </span>
                </div>
                <Progress value={chapterScore} className="w-full" />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-600">
                    {chapterScore}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Skor Chapter
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-600">
                    {passedQuizzes}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Quiz Lulus
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-orange-600">
                    {totalQuizzes - passedQuizzes}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Quiz Tersisa
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Status */}
          <div className="space-y-4">
            {isCompleted ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Selamat! Anda telah menyelesaikan chapter ini. Silakan
                  lanjutkan ke chapter berikutnya.
                </AlertDescription>
              </Alert>
            ) : canProceed ? (
              <Alert>
                <Trophy className="h-4 w-4" />
                <AlertDescription>
                  Chapter ini sudah dapat diselesaikan. Skor quiz Anda sudah
                  mencapai {chapterScore}% (≥ 65%).
                </AlertDescription>
              </Alert>
            ) : totalQuizzes > 0 ? (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Anda perlu menyelesaikan lebih banyak quiz untuk mencapai skor
                  minimal 65% agar dapat menyelesaikan chapter ini.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <PlayCircle className="h-4 w-4" />
                <AlertDescription>
                  Chapter ini tidak memiliki quiz. Anda dapat langsung
                  menyelesaikannya.
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            {!isCompleted && canProceed && (
              <div className="flex justify-center">
                <Button
                  onClick={handleMarkComplete}
                  disabled={updateProgressMutation.isPending}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updateProgressMutation.isPending ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Selesaikan Chapter
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Quiz Breakdown */}
      {totalQuizzes > 0 && calculation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Detail Penilaian Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Total Quiz</div>
                <div className="text-2xl font-bold">{totalQuizzes}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Quiz Lulus</div>
                <div className="text-2xl font-bold text-green-600">
                  {passedQuizzes}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Skor Chapter (Quiz Lulus / Total Quiz)</span>
                <span className="font-medium">{chapterScore}%</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Rumus: ({passedQuizzes}/{totalQuizzes}) × 100 = {chapterScore}
                  %
                </span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span>Minimum untuk lulus:</span>
                <span className="font-medium">65%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Status chapter:</span>
                <span
                  className={`font-medium ${
                    chapterScore >= 65 ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  {chapterScore >= 65
                    ? "Memenuhi syarat"
                    : "Belum memenuhi syarat"}
                </span>
              </div>
            </div>

            {chapterScore < 65 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Anda perlu lulus{" "}
                  {Math.ceil((65 * totalQuizzes) / 100) - passedQuizzes} quiz
                  lagi untuk mencapai skor minimal 65%.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Additional Notes */}
      {progress?.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Catatan Anda</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {progress.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChapterProgress;

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatVideoDuration } from "@/utils/formatVideoDuration";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  Play,
  Lock,
  BookOpen,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ChapterVideoPlayer } from "@/components/media/SecureVideo";
import {
  useChapterStatus,
  useUpdateProgress,
} from "@/hooks/use-chapter-progress";
import { useQueryClient } from "@tanstack/react-query";
import {
  CourseCompletionModal,
  useCourseCompletionDetection,
} from "@/components/course-completion-modal";

interface ChapterPlayerProps {
  course: any;
  chapter: any;
  chapters: any[];
  onNextChapter: () => void;
  onPreviousChapter: () => void;
  onChapterSelect: (chapterId: string) => void;
  courseId: string;
}

export default function ChapterPlayer({
  course,
  chapter,
  chapters,
  onNextChapter,
  onPreviousChapter,
  onChapterSelect,
  courseId,
}: ChapterPlayerProps) {
  const [watchedSeconds, setWatchedSeconds] = useState(
    chapter?.userProgress?.watchedSeconds || 0
  );

  const queryClient = useQueryClient();

  // Use chapter status hook for progress tracking
  const {
    progress,
    canProceed,
    isCompleted,
    totalQuizzes,
    passedQuizzes,
    refetch,
  } = useChapterStatus(chapter?.id);
  const updateProgressMutation = useUpdateProgress();
  const {
    showModal,
    completionData,
    handleCourseCompletion,
    handleDownloadCertificate,
    handleShareAchievement,
    handleViewCertificate,
    closeModal,
  } = useCourseCompletionDetection(course.id);

  // Find current chapter index and next chapter
  const currentIndex = chapters.findIndex((ch) => ch.chapterId === chapter.id);
  const hasNext = currentIndex < chapters.length - 1;
  const hasPrevious = currentIndex > 0;

  // Determine if Next button should be enabled
  const [isNextEnabled, setIsNextEnabled] = useState<boolean | undefined>(
    false
  );

  // Loading state for Next button
  const [isNextLoading, setIsNextLoading] = useState(false);

  useEffect(() => {
    if (!chapter) return;

    // Get current chapter data from chapters array (from useCourseProgress)
    const getCurrentChapterData = () => {
      return chapters.find((ch) => ch.chapterId === chapter.id);
    };

    const currentChapterData = getCurrentChapterData();

    // For chapters with no quizzes - Next button is always enabled (free or paid)
    if (
      !currentChapterData?.quizzes ||
      currentChapterData.quizzes.length === 0
    ) {
      setIsNextEnabled(true);
      return;
    }

    // For chapters with quizzes - check if all quizzes are passed using calculation data
    if (currentChapterData?.quizzes && currentChapterData.quizzes.length > 0) {
      const allQuizzesPassed = currentChapterData.calculation?.isCompleted;
      setIsNextEnabled(allQuizzesPassed || false);
      return;
    }

    // Default case - enable if chapter is completed based on calculation
    setIsNextEnabled(currentChapterData?.calculation?.isCompleted || false);
  }, [chapter, chapters, canProceed, isCompleted, totalQuizzes, passedQuizzes]);

  // Handle Next Chapter with proper progress update
  const handleNextChapterClick = async () => {
    if (!isNextEnabled || !hasNext || isNextLoading) {
      return;
    }

    setIsNextLoading(true);

    try {
      const currentChapterData = chapters.find(
        (ch) => ch.chapterId === chapter.id
      );
      const hasQuizzes =
        currentChapterData?.quizzes && currentChapterData.quizzes.length > 0;
      const currentChapterIndex = chapters.findIndex(
        (ch) => ch.chapterId === chapter.id
      );
      const isLastChapter = currentChapterIndex === chapters.length - 1;

      // For chapters without quizzes, mark as completed first
      if (!hasQuizzes) {
        await updateProgressMutation.mutateAsync({
          chapterId: chapter.id,
          isCompleted: true,
          watchedSeconds: Math.round(watchedSeconds),
        });

        // Invalidate all related queries
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["course-progress", courseId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["chapter-progress", chapter.id],
          }),
          queryClient.invalidateQueries({
            queryKey: ["can-proceed", chapter.id],
          }),
          queryClient.invalidateQueries({
            queryKey: ["progress"],
          }),
        ]);

        // Refetch to get latest data
        refetch();

        // Small delay to ensure UI updates
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (isLastChapter) {
          // Check course completion after a short delay
          setTimeout(async () => {
            await checkCourseCompletion();
          }, 500);
        }

        toast.success("Chapter completed!");
      }

      // Navigate to next chapter
      onNextChapter();
    } catch (error) {
      console.error("Failed to complete chapter:", error);
      toast.error("Failed to complete chapter. Please try again.");
    } finally {
      setIsNextLoading(false);
    }
  };

  // Handle chapter navigation with progress update
  const handleChapterNavigation = async (targetChapterId: string) => {
    try {
      // Auto-save current chapter progress before navigating
      const currentChapterData = chapters.find(
        (ch) => ch.chapterId === chapter.id
      );
      const hasQuizzes =
        currentChapterData?.quizzes && currentChapterData.quizzes.length > 0;

      // For chapters without quizzes, mark as completed if video was watched
      if (!hasQuizzes && watchedSeconds > 0) {
        await updateProgressMutation.mutateAsync({
          chapterId: chapter.id,
          isCompleted: true,
          watchedSeconds: Math.round(watchedSeconds),
        });

        // Invalidate queries to refresh data
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["course-progress", courseId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["chapter-progress", chapter.id],
          }),
        ]);
      } else if (watchedSeconds > 0) {
        // For chapters with quizzes or if we just need to save watched time
        await updateProgressMutation.mutateAsync({
          chapterId: chapter.id,
          watchedSeconds: Math.round(watchedSeconds),
        });
      }

      // Navigate to target chapter
      onChapterSelect(targetChapterId);
    } catch (error) {
      console.error("Failed to save progress before navigation:", error);
      // Still navigate even if progress save fails
      onChapterSelect(targetChapterId);
    }
  };

  // Function to check course completion
  const checkCourseCompletion = async () => {
    try {
      const response = await fetch(
        `/api/courses/${course.id}/completion-status`
      );
      const data = await response.json();

      if (data.isCompleted && data.certificate) {
        handleCourseCompletion({
          id: course.id,
          title: course.title,
          instructor: data.instructor || "Unknown Instructor",
          category: data.category || "General",
          level: course.level || "Beginner",
          completionDate: data.completionDate,
          certificateUrl: data.certificate.pdfUrl,
          certificateNumber: data.certificate.certificateNumber,
        });
      }
    } catch (error) {
      console.error("Error checking course completion:", error);
    }
  };

  // Update progress and mark as completed
  const handleProgressUpdate = async (
    watchedSeconds: number,
    isCompleted: boolean
  ) => {
    try {
      setWatchedSeconds(watchedSeconds);


      // Use the mutation for consistency
      const result = await updateProgressMutation.mutateAsync({
        chapterId: chapter.id,
        watchedSeconds: Math.round(watchedSeconds),
        isCompleted,
      });


      // Invalidate course progress immediately
      await queryClient.invalidateQueries({
        queryKey: ["course-progress", courseId],
      });

      // Show completion toast only once for video completion
      if (isCompleted && !progress?.isCompleted) {
        toast.success("Video completed!");
      }

      // Check if this is the last chapter and it's completed, then trigger certificate
      if (isCompleted) {
        const currentChapterIndex = chapters.findIndex(
          (ch) => ch.chapterId === chapter.id
        );
        const isLastChapter = currentChapterIndex === chapters.length - 1;

        if (isLastChapter) {
          // Small delay to ensure progress is saved
          setTimeout(async () => {
            await checkCourseCompletion();
          }, 500);
        }
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <Card>
        <CardContent className="p-0">
          <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
            <ChapterVideoPlayer
              videoKey={chapter.videoUrl}
              chapterId={chapter.id}
              chapterTitle={chapter.title}
              resumeTime={watchedSeconds}
              onProgressUpdate={handleProgressUpdate}
              className="w-full h-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Chapter Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onPreviousChapter}
          disabled={!hasPrevious}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {(() => {
            const currentChapterData = chapters.find(
              (ch) => ch.chapterId === chapter.id
            );
            const chapterCompleted =
              currentChapterData?.userProgress?.isCompleted || false;

            if (chapterCompleted) {
              return (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              );
            }
            return null;
          })()}

          {chapter.isFree && <Badge variant="outline">Free</Badge>}

          {/* Quiz Status Indicator */}
          {(() => {
            const currentChapterData = chapters.find(
              (ch) => ch.chapterId === chapter.id
            );
            const quizzesLength = currentChapterData?.quizzes?.length || 0;
            const passedQuizzesCount =
              currentChapterData?.calculation?.passedQuizzes || 0;
            const chapterCompleted =
              currentChapterData?.calculation?.isCompleted || false;

            if (quizzesLength > 0) {
              return (
                <Badge
                  variant={chapterCompleted ? "secondary" : "outline"}
                  className={
                    chapterCompleted ? "bg-blue-100 text-blue-800" : ""
                  }
                >
                  Quiz: {passedQuizzesCount}/{quizzesLength} Passed
                </Badge>
              );
            }
            return null;
          })()}
        </div>

        <div className="flex flex-col items-end gap-1">
          <Button
            variant="outline"
            onClick={handleNextChapterClick}
            disabled={!hasNext || !isNextEnabled || isNextLoading}
            className={
              (!isNextEnabled && hasNext) || isNextLoading ? "opacity-50" : ""
            }
          >
            {isNextLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>

          {/* Show reason why Next is disabled */}
          {hasNext && !isNextEnabled && !isNextLoading && (
            <span className="text-xs text-muted-foreground text-right">
              {(() => {
                const currentChapterData = chapters.find(
                  (ch) => ch.chapterId === chapter.id
                );
                const hasQuizzes =
                  currentChapterData?.quizzes &&
                  currentChapterData.quizzes.length > 0;

                if (hasQuizzes) {
                  return "Complete all quizzes to proceed";
                }
                return "Complete chapter to proceed";
              })()}
            </span>
          )}
        </div>
      </div>

      {/* Chapter Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{chapter.title}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatVideoDuration(chapter.duration || 0)}</span>
                </div>
                <span>
                  Chapter {currentIndex + 1} of {chapters.length}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        {chapter.description && (
          <CardContent>
            <p className="text-muted-foreground">{chapter.description}</p>
          </CardContent>
        )}
      </Card>

      {/* Other Chapters */}
      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {chapters.map((ch, index) => {
              const isCompleted = ch?.userProgress?.isCompleted;
              const isCurrentChapter = ch.chapterId === chapter.id;
              const isLocked = ch.isLocked;

              return (
                <div
                  key={ch.chapterId}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    isCurrentChapter
                      ? "bg-blue-50 border border-blue-200"
                      : isCompleted
                      ? "bg-green-50 hover:bg-green-100"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => !isLocked && handleChapterNavigation(ch.chapterId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Chapter Status */}
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                          isCompleted
                            ? "bg-green-100 text-green-700"
                            : isCurrentChapter
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : isLocked ? (
                          <Lock className="h-3 w-3" />
                        ) : isCurrentChapter ? (
                          <Play className="h-3 w-3" />
                        ) : (
                          index + 1
                        )}
                      </div>

                      {/* Chapter Info */}
                      <div>
                        <h4
                          className={`text-sm font-medium ${
                            isCurrentChapter ? "text-blue-700" : ""
                          }`}
                        >
                          {ch.chapterTitle}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatVideoDuration(ch.duration || 0)}</span>
                          </div>
                          {ch.isFree && (
                            <Badge variant="outline" className="text-xs">
                              Free
                            </Badge>
                          )}
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            <span>{ch?.calculation?.totalQuizzes} Quiz</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Play Button */}
                    {!isLocked && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChapterNavigation(ch.chapterId);
                        }}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Course Completion Modal */}
      {completionData && (
        <CourseCompletionModal
          isOpen={showModal}
          onClose={closeModal}
          courseData={completionData}
          onViewCertificate={handleViewCertificate}
          onShareAchievement={handleShareAchievement}
          onDownloadCertificate={handleDownloadCertificate}
        />
      )}
    </div>
  );
}

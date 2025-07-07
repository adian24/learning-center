"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatVideoDuration } from "@/utils/formatVideoDuration";
import {
  Play,
  Clock,
  BookOpen,
  CheckCircle,
  Lock,
  PlayCircle,
  Video,
  VideoOff,
  LockKeyhole,
  Award,
  ArrowUpRight,
} from "lucide-react";
import { CourseImageCard } from "@/components/media/SecureImage";
import { StarFilledIcon } from "@radix-ui/react-icons";
import Link from "next/link";

interface CourseOverviewProps {
  course: any;
  chapters: any[];
  onChapterSelect: (chapterId: string) => void;
}

export default function CourseOverview({
  course,
  chapters,
  onChapterSelect,
}: CourseOverviewProps) {
  // Calculate progress
  const totalChapters = chapters.length;
  const completedChapters = chapters.filter(
    (ch) => ch.userProgress?.isCompleted
  ).length;
  const progressPercentage =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;
  const completed = progressPercentage === 100;

  // Get next chapter to continue
  const nextChapter = chapters.find((ch) => !ch.userProgress?.isCompleted);
  let playText = "";
  if (progressPercentage === 0) {
    playText = "Start Learning";
  } else if (progressPercentage > 0 && progressPercentage < 100) {
    playText = "Continue Learning";
  } else {
    playText = "Review Course";
  }

  const lastWatchedChapter = chapters
    .filter((ch) => ch.userProgress?.watchedSeconds > 0)
    .sort(
      (a, b) =>
        new Date(b.userProgress.updatedAt).getTime() -
        new Date(a.userProgress.updatedAt).getTime()
    )[0];

  const continueChapter = lastWatchedChapter || nextChapter || chapters[0];

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Course Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <CourseImageCard
                imageKey={course.imageUrl}
                courseId={course.id}
                courseTitle={course.title}
                className="aspect-video w-full"
              />
              {!completed ? (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button
                    size="lg"
                    className="bg-white/90 text-black hover:bg-white"
                    onClick={() => onChapterSelect(continueChapter.id)}
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    {playText}
                  </Button>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button
                    size="lg"
                    className="bg-white/90 text-green-600 hover:bg-white"
                  >
                    <StarFilledIcon className="h-5 w-5 mr-2 text-yellow-500" />
                    {playText}
                  </Button>
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="md:col-span-2">
              <div className="flex justify-between">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">{course.category?.name}</Badge>
                  <Badge variant="secondary">
                    {course.level.toLowerCase()}
                  </Badge>
                </div>

                {completed && (
                  <Link href="/certificates">
                    <Button
                      className="bg-sky-50 border border-sky-300 text-sky-500 font-semibold hover:text-yellow-500 hover:bg-yellow-50 hover:border-yellow-300"
                      size="lg"
                    >
                      <Award />
                      Lihat Sertifikat
                      <ArrowUpRight />
                    </Button>
                  </Link>
                )}
              </div>

              <h1 className="text-2xl font-bold mb-3">{course.title}</h1>
              <p className="text-muted-foreground mb-4">{course.description}</p>

              {/* Course Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatVideoDuration(course.duration || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{totalChapters} chapters</span>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Course Progress</span>
                  <span className="font-medium">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {completedChapters}/{totalChapters} chapters completed
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapters List */}
      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {chapters.map((chapter, index) => {
              const canAccess = chapter.canAccess;
              const isCompleted = chapter.userProgress?.isCompleted;
              const watchedSeconds = chapter.userProgress?.watchedSeconds || 0;
              const isStarted = watchedSeconds > 0;
              const isLocked = course.isLocked;

              return (
                <div
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    isCompleted
                      ? "bg-green-50 border-green-200"
                      : isStarted
                      ? "bg-blue-50 border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() =>
                    !chapter.isLocked && onChapterSelect(chapter.chapterId)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Chapter Number */}
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                          isCompleted
                            ? "bg-green-100 text-green-700"
                            : isStarted
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : isLocked ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>

                      {/* Chapter Info */}
                      <div className="flex-1">
                        <h3 className="font-medium">{chapter.chapterTitle}</h3>
                        <h3 className="text-xs">{chapter.id}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            {chapter.videoUrl ? (
                              <Video className="h-3 w-3" />
                            ) : (
                              <VideoOff className="h-3 w-3" />
                            )}
                            <span>
                              {formatVideoDuration(chapter.duration || 0)}
                            </span>
                          </div>

                          {chapter.isFree && (
                            <Badge variant="outline" className="text-xs">
                              Free
                            </Badge>
                          )}

                          {chapter.quizzes?.length > 0 && (
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              <span>{chapter.quizzes.length} Quiz</span>
                            </div>
                          )}
                        </div>

                        {chapter.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {chapter.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Play Button */}
                    <div className="flex items-center gap-2">
                      {chapter?.isLocked && (
                        <div className="text-xs text-blue-600 font-medium">
                          {chapter?.lockReason}
                        </div>
                      )}

                      <Button
                        variant={isCompleted ? "secondary" : "ghost"}
                        size="sm"
                        disabled={chapter.isLocked}
                        onClick={(e) => {
                          e.stopPropagation();
                          onChapterSelect(chapter.id);
                        }}
                      >
                        {chapter?.isLocked ? (
                          <LockKeyhole className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

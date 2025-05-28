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
} from "lucide-react";
import { CourseImageCard } from "@/components/media/SecureImage";

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
    (ch) => ch.userProgress?.[0]?.isCompleted
  ).length;
  const progressPercentage =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;

  // Get next chapter to continue
  const nextChapter = chapters.find((ch) => !ch.userProgress?.[0]?.isCompleted);
  const lastWatchedChapter = chapters
    .filter((ch) => ch.userProgress?.[0]?.watchedSeconds > 0)
    .sort(
      (a, b) =>
        new Date(b.userProgress[0].updatedAt).getTime() -
        new Date(a.userProgress[0].updatedAt).getTime()
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
              {continueChapter && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button
                    size="lg"
                    className="bg-white/90 text-black hover:bg-white"
                    onClick={() => onChapterSelect(continueChapter.id)}
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    {lastWatchedChapter ? "Continue" : "Start"} Learning
                  </Button>
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">{course.category?.name}</Badge>
                <Badge variant="secondary">{course.level.toLowerCase()}</Badge>
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
              const isCompleted = chapter.userProgress?.[0]?.isCompleted;
              const watchedSeconds =
                chapter.userProgress?.[0]?.watchedSeconds || 0;
              const isStarted = watchedSeconds > 0;
              const isLocked = !chapter.isFree && !course.isEnrolled;

              return (
                <div
                  key={chapter.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    isCompleted
                      ? "bg-green-50 border-green-200"
                      : isStarted
                      ? "bg-blue-50 border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => !isLocked && onChapterSelect(chapter.id)}
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
                        <h3 className="font-medium">{chapter.title}</h3>
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

                          {!chapter.isPublished && (
                            <Badge variant="secondary" className="text-xs">
                              Coming Soon
                            </Badge>
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
                      {isStarted && !isCompleted && (
                        <div className="text-xs text-blue-600 font-medium">
                          In Progress
                        </div>
                      )}

                      <Button
                        variant={isCompleted ? "secondary" : "ghost"}
                        size="sm"
                        disabled={isLocked || !chapter.isPublished}
                        onClick={(e) => {
                          e.stopPropagation();
                          onChapterSelect(chapter.id);
                        }}
                      >
                        {isCompleted ? (
                          "Review"
                        ) : isStarted ? (
                          "Continue"
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

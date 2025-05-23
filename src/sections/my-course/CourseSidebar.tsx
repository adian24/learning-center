"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { formatVideoDuration } from "@/utils/formatVideoDuration";
import {
  BookOpen,
  Clock,
  FileText,
  Award,
  ExternalLink,
  Download,
  HelpCircle,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";

interface CourseSidebarProps {
  course: any;
  currentChapter: any;
  chapters: any[];
}

export default function CourseSidebar({
  course,
  currentChapter,
  chapters,
}: CourseSidebarProps) {
  // Calculate progress
  const totalChapters = chapters.length;
  const completedChapters = chapters.filter(
    (ch) => ch.userProgress?.[0]?.isCompleted
  ).length;
  const progressPercentage =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;

  // Get current chapter resources and quizzes
  const resources = currentChapter?.resources || [];
  const quizzes = currentChapter?.quizzes || [];

  return (
    <div className="space-y-6">
      {/* Course Info Card */}
      <Card>
        <CardContent className="p-4">
          {/* Course Thumbnail */}
          <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
            <Image
              src={course.imageUrl || "/placeholder-course.jpg"}
              alt={course.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Course Details */}
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-sm line-clamp-2">
                {course.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {course.description}
              </p>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>{formatVideoDuration(course.duration || 0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3 text-muted-foreground" />
                <span>{totalChapters} chapters</span>
              </div>
            </div>

            <Separator />

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium">Progress</span>
                <span className="text-muted-foreground">
                  {progressPercentage}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completedChapters}/{totalChapters} chapters completed
              </p>
            </div>

            {/* Course Category & Level */}
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {course.category?.name}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {course.level.toLowerCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Card */}
      {quizzes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Chapter Quiz
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {quizzes.map((quiz: any, index: number) => (
                <div key={quiz.id} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium">{quiz.title}</h4>
                      {quiz.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {quiz.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {quiz.questions?.length || 0} questions
                        </span>
                        {quiz.timeLimit && (
                          <>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {quiz.timeLimit} min
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button size="sm" className="w-full" variant="outline">
                    Take Quiz
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources Card */}
      {resources.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Chapter Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {resources.map(
                (
                  resource: {
                    id: string;
                    type: string;
                    title: string;
                    url: string;
                  },
                  index: number
                ) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-2 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {resource.type === "PDF" ? (
                        <FileText className="h-4 w-4 text-red-500" />
                      ) : resource.type === "LINK" ? (
                        <ExternalLink className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Download className="h-4 w-4 text-green-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{resource.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {resource.type.toLowerCase()}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(resource.url, "_blank")}
                    >
                      {resource.type === "LINK" ? (
                        <ExternalLink className="h-3 w-3" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificate Card */}
      {progressPercentage === 100 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-green-700">
              <Award className="h-4 w-4" />
              Certificate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Course Completed!</span>
              </div>

              <p className="text-xs text-green-600">
                Congratulations! You've completed all chapters in this course.
              </p>

              <Button
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Download Certificate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Instructor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Instructor</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              <Image
                src={course.teacher?.user?.image || "/placeholder-avatar.jpg"}
                alt={course.teacher?.user?.name || "Instructor"}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium">
                {course.teacher?.user?.name || "Instructor"}
              </p>
              <p className="text-xs text-muted-foreground">Course Instructor</p>
            </div>
          </div>

          {course.teacher?.bio && (
            <p className="text-xs text-muted-foreground mt-3 line-clamp-3">
              {course.teacher.bio}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

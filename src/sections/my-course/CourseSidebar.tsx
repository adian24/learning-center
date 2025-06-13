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
  CheckCircle,
} from "lucide-react";
import { CourseImageCard, AvatarImage } from "@/components/media/SecureImage";
import StudentQuizzes from "./StudentQuizzes";

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

  return (
    <div className="space-y-6">
      {/* Course Info Card */}
      <Card>
        <CardContent className="p-4">
          {/* Course Thumbnail */}
          <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
            <CourseImageCard
              imageKey={course.imageUrl}
              courseId={course.id}
              courseTitle={course.title}
              className="aspect-video w-full"
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
                <span>{totalChapters} bab</span>
              </div>
            </div>

            <Separator />

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium">Progres</span>
                <span className="text-muted-foreground">
                  {progressPercentage}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completedChapters}/{totalChapters} bab selesai
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
      <StudentQuizzes chapterId={currentChapter?.id} />

      {/* Resources Card */}
      {resources.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Materi Bab
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
              Sertifikat
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Kursus Selesai!</span>
              </div>

              <p className="text-xs text-green-600">
                Selamat! Anda telah menyelesaikan semua bab dalam kursus ini.
              </p>

              <Button
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Unduh Sertifikat
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Instructor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Instruktur</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-3">
            <AvatarImage
              imageKey={course.teacher?.user?.image}
              userName={course.teacher?.user?.name || "Instruktur"}
              size={40}
              className="flex-shrink-0"
            />
            <div>
              <p className="text-sm font-medium">
                {course.teacher?.user?.name || "Instruktur"}
              </p>
              <p className="text-xs text-muted-foreground">Instruktur Kursus</p>
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

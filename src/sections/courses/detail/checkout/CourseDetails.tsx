// src/app/courses/[courseId]/checkout/_components/course-details.tsx
import { BookOpen, Clock, Award, Star } from "lucide-react";
import { CourseImageCard } from "@/components/media/SecureImage";

export function CourseDetails({ course }: { course: any }) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="relative aspect-video">
        {course.imageUrl ? (
          <CourseImageCard
            imageKey={course.imageUrl}
            courseId={course.id}
            courseTitle={course.title}
            className="aspect-video w-full"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{course.title}</h3>

        {course.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {course.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{course.duration || 0} minutes</span>
          </div>

          <div className="flex items-center gap-1.5 text-sm">
            <Award className="h-4 w-4 text-muted-foreground" />
            <span>
              {course.level.charAt(0).toUpperCase() +
                course.level.slice(1).toLowerCase()}
            </span>
          </div>

          {course.totalSteps > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span>{course.totalSteps} lessons</span>
            </div>
          )}

          {course.rating && (
            <div className="flex items-center gap-1.5 text-sm">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span>
                {course.rating.toFixed(1)} ({course.reviewCount})
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Course price</span>
            <span className="font-medium">
              ${course.price?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

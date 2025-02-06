import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCourseQuery } from "@/hooks/use-course-query";
import { formatPrice } from "@/utils/formatPrice";
import { Plus } from "lucide-react";
import React from "react";

interface CourseDetailProps {
  courseId: string | number;
}

const CourseDetail = ({ courseId }: CourseDetailProps) => {
  const { data: course } = courseId ? useCourseQuery(String(courseId)) : {};

  return (
    <div className="p-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{course?.title}</h2>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={course?.isPublished ? "default" : "secondary"}>
                  {course?.isPublished ? "Published" : "Draft"}
                </Badge>
                <Badge variant="outline">{course?.level}</Badge>
                {course?.price ?? 0 > 0 ? (
                  <Badge variant="outline">
                    {formatPrice(course?.price ?? 0)}
                  </Badge>
                ) : (
                  <Badge variant="outline">Free</Badge>
                )}
              </div>
              {course?.description && (
                <p className="text-muted-foreground">{course?.description}</p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Chapters</h3>
              <Button
                onClick={() => {
                  /* Add chapter handler */
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Chapter
              </Button>
            </div>
            {/* <ChapterList courseId={courseId} /> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseDetail;

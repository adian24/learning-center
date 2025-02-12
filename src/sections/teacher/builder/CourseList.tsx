import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Course } from "@/lib/types";
import { BookOpenCheck, CircleIcon } from "lucide-react";
import React from "react";

const levelColors = {
  BEGINNER: "bg-green-100 text-green-800",
  INTERMEDIATE: "bg-blue-100 text-blue-800",
  ADVANCED: "bg-purple-100 text-purple-800",
};

interface CourseListProps {
  courses?: Course[];
  isLoading: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
}

const CourseList = ({
  courses,
  isLoading,
  selectedId,
  onSelect,
}: CourseListProps) => {
  if (isLoading) {
    return <div className="p-4">Loading courses...</div>;
  }

  if (!courses?.length) {
    return <div className="p-4">No courses found</div>;
  }

  const handleCourseClick = (courseId: string) => {
    if (courseId !== selectedId) {
      onSelect(courseId);
    }
  };
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold mb-4">Your Courses</h2>
      <div className="space-y-3">
        {courses?.map((course) => (
          <Card
            key={course.id}
            className={`p-4 cursor-pointer hover:shadow-md transition ${selectedId === course.id ? "border-2 border-primary" : ""
              }`}
            onClick={() => handleCourseClick(course.id)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{course.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={course.isPublished ? "default" : "secondary"}>
                    <CircleIcon
                      className={`w-2 h-2 mr-1 ${course.isPublished ? "text-green-500" : "text-gray-500"
                        }`}
                    />
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <Badge className={levelColors[course.level]}>
                    {course.level.charAt(0) +
                      course.level.slice(1).toLowerCase()}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center text-muted-foreground">
                <BookOpenCheck className="w-4 h-4 mr-1" />
                <span className="text-sm">{course.chapters.length}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CourseList;

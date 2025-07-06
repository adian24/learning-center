import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Users } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { AvatarImage, CourseImageCard } from "@/components/media/SecureImage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TeacherCourse } from "@/hooks/use-teacher-courses-query";

interface CourseCardProps {
  course: TeacherCourse;
}

const TeacherCourseCard = ({ course }: CourseCardProps) => {
  return (
    <Card key={course.id} className="flex flex-col">
      <div className="relative">
        <CourseImageCard
          imageKey={course.imageUrl}
          courseId={course.id}
          courseTitle={course.title}
          className="aspect-video w-full"
        />
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <Link
            href={`/teacher/courses/${course.id}`}
            className="hover:underline hover:text-blue-600 transition-colors"
          >
            <CardTitle className="text-xl">{course.title}</CardTitle>
          </Link>
          {/* <CourseActions course={course} /> */}
        </div>
        <CardDescription className="line-clamp-2">
          {course.description}
        </CardDescription>

        {/* Display teacher company info in teacher view for reference */}
        {course.teacher?.company && (
          <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded-md">
            {course.teacher?.company.logoUrl ? (
              <Avatar className="h-6 w-6">
                <AvatarImage
                  imageKey={course.teacher?.company.logoUrl}
                  userName={course.teacher?.company.name}
                  size={22}
                />
              </Avatar>
            ) : (
              <AvatarFallback className="text-xs">
                {course.teacher?.company.name.charAt(0)}
              </AvatarFallback>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>{course.teacher?.company.name}</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="flex justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {course.enrolledCount} siswa
          </div>
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-1" />
            {course.chapters.length} chapter
          </div>
          <div className="font-medium text-gray-900">
            {formatPrice(course?.price || 0)}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs mt-6">
          <Badge variant="secondary">{course.level}</Badge>
          <Badge
            className={`${
              course.isPublished
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {course.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherCourseCard;

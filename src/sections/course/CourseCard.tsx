import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Course } from "@/lib/types";
import { BookOpen, Users, CheckCircle, Building2 } from "lucide-react";
import CourseActions from "./CourseActions";
import { formatPrice } from "@/utils/formatPrice";
import { AvatarImage, CourseImageCard } from "@/components/media/SecureImage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CourseWithCompany } from "@/hooks/use-courses-query";

interface CourseCardProps {
  course: CourseWithCompany;
}

const TeacherCourseCard = ({ course }: CourseCardProps) => {
  console.log("Rendering TeacherCourseCard for course:", course);

  return (
    <Card key={course.id} className="flex flex-col">
      <div className="relative">
        <CourseImageCard
          imageKey={course.imageUrl}
          courseId={course.id}
          courseTitle={course.title}
          className="aspect-video w-full"
        />

        {course.isEnrolled && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-100 text-green-800 border border-green-300 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>Enrolled</span>
            </Badge>
          </div>
        )}
        {/* <Badge
          className={`absolute top-2 ${
            course.isEnrolled ? "left-2" : "right-2"
          } ${
            course.isPublished
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {course.isPublished ? "Published" : "Draft"}
        </Badge> */}
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
        {course.teacherCompany && (
          <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded-md">
            {course.teacherCompany.logoUrl ? (
              <Avatar className="h-6 w-6">
                <AvatarImage
                  imageKey={course.teacherCompany.logoUrl}
                  userName={course.teacherCompany.name}
                  size={22}
                />
              </Avatar>
            ) : (
              <AvatarFallback className="text-xs">
                {course.teacherCompany.name.charAt(0)}
              </AvatarFallback>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>{course.teacherCompany.name}</span>
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
            {course.chapterCount} chapter
          </div>
          <div className="font-medium text-gray-900">
            {formatPrice(course?.price || 0)}
          </div>
        </div>
        <Badge variant="secondary" className="mt-3">
          {course.level}
        </Badge>
        {course.isEnrolled && (
          <div className="mt-3 pt-4 border-t flex items-center gap-2 text-green-700 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>You are enrolled in this course</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherCourseCard;

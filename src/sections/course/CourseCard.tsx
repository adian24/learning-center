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
import { BookOpen, Users, CheckCircle } from "lucide-react";
import CourseActions from "./CourseActions";
import { formatPrice } from "@/utils/formatPrice";
import { CourseImageCard } from "@/components/media/SecureImage";

interface CourseCardProps {
  course: Course & { isEnrolled?: boolean };
}

const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <Card key={course.id} className="flex flex-col">
      <div className="relative">
        <CourseImageCard
          imageKey={course.imageUrl} // Now expects S3 key instead of full URL
          courseId={course.id}
          courseTitle={course.title}
          className="aspect-video w-full"
        />

        {/* Add enrollment status badge */}
        {course.isEnrolled && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-100 text-green-800 border border-green-300 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>Enrolled</span>
            </Badge>
          </div>
        )}
        <Badge
          className={`absolute top-2 ${
            course.isEnrolled ? "left-2" : "right-2"
          } ${
            course.isPublished
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {course.isPublished ? "Published" : "Draft"}
        </Badge>
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <Link
            href={`/teacher/courses/${course.id}`}
            className="hover:underline hover:text-blue-600 transition-colors"
          >
            <CardTitle className="text-xl">{course.title}</CardTitle>
          </Link>
          <CourseActions course={course} />
        </div>
        <CardDescription>{course.description}</CardDescription>
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
            {formatPrice(course.price)}
          </div>
        </div>
        <Badge variant="secondary" className="mt-3">
          {course.level}
        </Badge>
        {/* Add enrollment indicator in card footer */}
        {course.isEnrolled && (
          <div className="mt-3 pt-2 border-t flex items-center gap-2 text-green-700 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>You are enrolled in this course</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseCard;

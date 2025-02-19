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
import { BookOpen, Users } from "lucide-react";
import CourseActions from "./CourseActions";
import { formatPrice } from "@/utils/formatPrice";
import Image from "next/image";

const CourseCard = ({ course }: { course: Course }) => {
  return (
    <Card key={course.id} className="flex flex-col">
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <Image
          src={course.imageUrl}
          alt={course.title}
          className="object-cover w-full h-full"
        />
        <Badge
          className={`absolute top-2 right-2 ${
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
      </CardContent>
    </Card>
  );
};

export default CourseCard;

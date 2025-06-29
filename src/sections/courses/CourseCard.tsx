import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Star,
  Users,
  Building2,
} from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { formatVideoDuration } from "@/utils/formatVideoDuration";
import { AvatarImage, CourseImageCard } from "@/components/media/SecureImage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Updated Course type to include company info
type StudentCourseProps = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  level: string;
  duration?: number | null;
  totalSteps: number;
  rating?: number | null;
  reviewCount: number;
  language?: string | null;
  teacherName?: string | null;
  teacherProfileUrl?: string | null;
  teacherCompany?: {
    id: string;
    name: string;
    logoUrl?: string | null;
    location?: string | null;
    industry?: string | null;
  } | null;
  enrolledCount: number;
  chapterCount: number;
  isEnrolled?: boolean;
};

const CourseCard = ({ course }: { course: StudentCourseProps }) => {
  return (
    <Card key={course.id} className="flex flex-col h-full">
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
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <Link
            href={`/courses/${course.id}`}
            className="hover:underline hover:text-sky-600 transition-colors"
          >
            <CardTitle className="text-md">{course.title}</CardTitle>
          </Link>
        </div>
        <CardDescription className="line-clamp-2 text-xs">
          {course.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {course.enrolledCount} students
          </div>
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-1" />
            {course.chapterCount} chapters
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {course.duration
              ? `${formatVideoDuration(course.duration)}`
              : "N/A"}
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
            {course.rating ? course.rating.toFixed(1) : "New"}
            {course.reviewCount > 0 && ` (${course.reviewCount})`}
          </div>
        </div>

        <div className="flex space-x-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            {course.level}
          </Badge>
          {course.language && (
            <Badge variant="outline">{course.language}</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="mt-auto border-t p-4">
        <div className="flex items-center gap-2">
          <div>
            {course.teacherCompany?.logoUrl ? (
              <Avatar className="h-6 w-6">
                <AvatarImage
                  imageKey={course.teacherCompany.logoUrl}
                  userName={course.teacherCompany.name}
                  size={22}
                />
              </Avatar>
            ) : (
              <AvatarFallback className="text-xs">
                {course?.teacherCompany?.name.charAt(0)}
              </AvatarFallback>
            )}
          </div>
          <div className="text-xs">
            By {course.teacherName || "Instructor"}
            {course.teacherCompany && (
              <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                <span>from {course.teacherCompany.name}</span>
              </div>
            )}
          </div>
        </div>
      </CardFooter>
      <CardFooter className="mt-auto border-t p-4 flex justify-center">
        <div className="font-black text-lg text-sky-600">
          {formatPrice(Number(course.price))}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;

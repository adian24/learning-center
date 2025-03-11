import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/hooks/use-course";
import { formatVideoDuration } from "@/utils/formatVideoDuration";
import { Clock, Star } from "lucide-react";

const CourseHeaderSkeleton = () => {
  return (
    <div className="md:w-2/3 animate-pulse">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <Skeleton className="h-10 w-full max-w-md mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6 mb-1" />
        <Skeleton className="h-4 w-4/6 mb-4" />

        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-6 w-28 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-md" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>

      <Skeleton className="w-full rounded-lg h-64 md:h-80" />
    </div>
  );
};

interface CourseHeaderProps {
  courseId: string;
}

const CourseHeader = ({ courseId }: CourseHeaderProps) => {
  const { data, isLoading } = useCourse(courseId);
  const course = data?.course;
  const teacher = course?.teacher;

  if (isLoading) {
    return <CourseHeaderSkeleton />;
  }

  return (
    <div className="md:w-full">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-blue-600 bg-blue-50">
            {course?.category?.name}
          </Badge>
          <Badge variant="outline" className="text-green-600 bg-green-50">
            {course?.level === "BEGINNER"
              ? "Beginner"
              : course?.level === "INTERMEDIATE"
              ? "Intermediate"
              : "Advanced"}
          </Badge>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{course?.title}</h1>
        <p className="text-gray-600 mb-4">{course?.description}</p>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 font-medium">{course?.rating ?? 0}</span>
            <span className="ml-1 text-gray-500">
              ({course?.reviewCount} ulasan)
            </span>
          </div>
          {/* <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-500" />
            <span className="ml-1 text-gray-500">
              {courseMock.enrolledStudents} students
            </span>
          </div> */}
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-500" />
            <span className="ml-1 text-gray-500">
              {formatVideoDuration(course?.duration as number) ?? 0}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={teacher?.user?.image as string}
              alt={teacher?.user?.name as string}
            />
            <AvatarFallback>
              {String(teacher?.user?.name)
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{teacher?.user?.name}</p>
            <p className="text-xs text-gray-500">Course Instructor</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;

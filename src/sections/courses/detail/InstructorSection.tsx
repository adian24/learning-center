import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/hooks/use-course";

interface InstructorSectionProps {
  courseId: string;
  courseMock: any;
}

const InstructorSection = ({ courseId }: InstructorSectionProps) => {
  const { data, isLoading } = useCourse(courseId);
  const course = data?.course;
  const teacher = course?.teacher;

  if (isLoading) {
    return <InstructorSectionSkeleton />;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Instruktur Course</h2>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4 flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-2">
                <AvatarImage
                  src={teacher?.user?.image ?? ""}
                  alt={teacher?.user?.name ?? ""}
                />
                <AvatarFallback>
                  {teacher?.user?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-medium text-center">{teacher?.user?.name}</h3>
              {/* <div className="flex items-center mt-2">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="ml-1 text-sm">4.7 Instructor Rating</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-medium">14,382</span> Students
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">7</span> Courses
              </p> */}
            </div>
            <div className="md:w-3/4">
              <p className="text-gray-700 mb-4 text-sm">{teacher?.bio ?? ""}</p>
              <div className="mb-4">
                <h4 className="font-medium mb-2">Keahlian:</h4>
                <div className="flex flex-wrap gap-2">
                  {teacher?.expertise?.map((item: any, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const InstructorSectionSkeleton = () => {
  return (
    <div className="mb-8">
      <Skeleton className="h-8 w-48 mb-4" />
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4 flex flex-col items-center">
              {/* Avatar skeleton */}
              <Skeleton className="h-24 w-24 rounded-full mb-2" />

              {/* Name skeleton */}
              <Skeleton className="h-5 w-36 mb-1" />

              {/* Title skeleton */}
              <Skeleton className="h-4 w-48 mb-2" />

              {/* Rating skeleton */}
              <div className="flex items-center mt-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-32 ml-1" />
              </div>

              {/* Students count skeleton */}
              <Skeleton className="h-4 w-24 mt-1" />

              {/* Courses count skeleton */}
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="md:w-3/4">
              {/* Bio skeleton - multiple lines */}
              <div className="space-y-2 mb-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              {/* Expertise section */}
              <div className="mb-4">
                <Skeleton className="h-5 w-40 mb-2" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-7 w-32 rounded-full" />
                  <Skeleton className="h-7 w-24 rounded-full" />
                </div>
              </div>

              {/* Button skeleton */}
              <Skeleton className="h-10 w-36 rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorSection;

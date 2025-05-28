import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSimilarCourses } from "@/hooks/use-similar-course";
import { Course } from "@/lib/types";
import { formatPrice } from "@/utils/formatPrice";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { CourseImageCard } from "@/components/media/SecureImage";

interface SimilarCourseProps {
  courseId: string;
}

const SimilarCourse = ({ courseId }: SimilarCourseProps) => {
  const router = useRouter();
  const { data, isLoading } = useSimilarCourses(courseId, 3, true);
  const similarCourses = data?.similarCourses;
  const recommendationType = data?.recommendationType;

  const getSectionTitle = () => {
    switch (recommendationType) {
      case "SAME_TEACHER":
        return "Kursus Lainnya dari Instruktur Ini";
      case "SAME_CATEGORY":
        return `Kurus Lainya di ${
          similarCourses?.[0]?.category?.name || "This Category"
        }`;
      default:
        return "Mungkin Anda Suka";
    }
  };

  const handleNavigateCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">{getSectionTitle()}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-4 w-32 mb-3" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">{getSectionTitle()}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {similarCourses?.map((course: Course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="relative h-40 w-full">
              <CourseImageCard
                imageKey={course.imageUrl}
                courseId={course.id}
                courseTitle={course.title}
                className="h-full w-full"
              />
            </div>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center mb-2">
                <Badge
                  variant="outline"
                  className="text-blue-600 bg-blue-50 text-xs"
                >
                  {course.category.name}
                </Badge>
                <span className="text-xs font-bold">
                  {formatPrice(course.price)}
                </span>
              </div>
              <h3 className="font-medium mb-2 line-clamp-2 h-12">
                {course.title}
              </h3>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(course.rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-500 ml-1">
                  {course.rating} ({course.reviewCount})
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleNavigateCourse(course.id)}
              >
                Lihat Detail
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SimilarCourse;

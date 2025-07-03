import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSimilarCourses } from "@/hooks/use-similar-course";
import { Course } from "@/lib/types";
import { formatPrice } from "@/utils/formatPrice";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { AvatarImage, CourseImageCard } from "@/components/media/SecureImage";
import { AvatarFallback } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";

interface SimilarCourseProps {
  courseId: string;
}

const SimilarCourse = ({ courseId }: SimilarCourseProps) => {
  const t = useTranslations("courses");

  const router = useRouter();
  const { data, isLoading } = useSimilarCourses(courseId, 3, true);
  const similarCourses = data?.similarCourses;
  const recommendationType = data?.recommendationType;

  const getSectionTitle = () => {
    switch (recommendationType) {
      case "SAME_TEACHER":
        return t("similar_title_same_teacher");
      case "SAME_CATEGORY":
        return t("similar_title_same_category", {
          category: similarCourses?.[0]?.category?.name || "",
        });
      default:
        return t("similar_title_general");
    }
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
        {similarCourses?.map((course: Course, index) => (
          <Card
            className="overflow-hidden hover:shadow-lg transition-shadow"
            key={index}
          >
            <CourseImageCard
              imageKey={course.imageUrl}
              courseId={course.id}
              courseTitle={course.title}
              className="aspect-video w-full"
            />
            <CardContent className="p-4">
              <h3 className="font-medium text-sm mb-2 line-clamp-2">
                {course.title}
              </h3>

              {/* Teacher and Company Info */}
              <div className="flex flex-col mb-2">
                <div className="flex items-center gap-2">
                  {course?.teacher?.company?.logoUrl ? (
                    <AvatarImage
                      imageKey={course.teacher.company.logoUrl}
                      userName={course.teacher.company.name}
                      size={25}
                    />
                  ) : (
                    <AvatarFallback className="h-6 w-6">
                      {course.teacher?.user?.name?.charAt(0)}
                    </AvatarFallback>
                  )}
                  <div>
                    <span className="text-sm font-semibold truncate max-w-30">
                      {course.teacher?.user?.name}
                    </span>
                    <div className="text-xs text-muted-foreground truncate max-w-30">
                      <span>{course?.teacher?.company?.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs">
                    {course.rating ? course.rating.toFixed(1) : t("rating_new")}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {course.level}
                </Badge>
              </div>

              <Button
                onClick={() => router.push(`/courses/${course.id}`)}
                className="w-full"
                size="sm"
              >
                {t("button_view_course", { price: formatPrice(course.price) })}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SimilarCourse;

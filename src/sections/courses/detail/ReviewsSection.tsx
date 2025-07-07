"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useReviews } from "@/hooks/use-course-reviews";
import { formatDate } from "date-fns";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

interface ReviewsSectionProps {
  courseId: string;
}

const ReviewsSection = ({ courseId }: ReviewsSectionProps) => {
  const t = useTranslations("reviews");

  const { data, isLoading, isError } = useReviews(courseId, 1);

  const reviews = data?.items;

  if (isLoading) {
    return <div className="flex justify-center p-6">{t("loading")}</div>;
  }

  if (isError) {
    return <div className="text-center text-destructive p-6">{t("error")}</div>;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{t("section_title")}</h2>
        <Button variant="link" className="text-blue-600">
          {t("view_all")}
        </Button>
      </div>

      {reviews?.length === 0 ? (
        <div className="flex justify-center items-center p-6">
          {t("no_reviews")}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews?.map((review: any) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    {review?.student?.user?.image ? (
                      <AvatarImage
                        src={review.student.user.image}
                        alt={review.student.user.name}
                      />
                    ) : (
                      <AvatarFallback>
                        {review.student.user.name?.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm">
                          {review.student.user.name}
                        </h4>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.createdAt, "dd MMM yyyy")}
                      </span>
                    </div>
                    <p className="mt-2 text-muted-foreground text-xs">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useReviews } from "@/hooks/use-course-reviews";
import { Star } from "lucide-react";

interface ReviewsSectionProps {
  courseId: string;
}

const ReviewsSection = ({ courseId }: ReviewsSectionProps) => {
  const { data, isLoading, isError } = useReviews(courseId, 2);

  const reviews = data?.items;

  if (isLoading) {
    return <div className="flex justify-center p-6">Loading reviews...</div>;
  }

  if (isError) {
    return (
      <div className="text-center text-destructive p-6">
        Failed to load reviews
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Ulasan</h2>
        <Button variant="link" className="text-blue-600">
          Lihat Semua Ulasan
        </Button>
      </div>

      {reviews?.length === 0 ? (
        <div className="flex justify-center items-center p-6">
          Belum ada ulasan
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews?.map((review: any) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage
                      src={review.user.image}
                      alt={review.user.name}
                    />
                    <AvatarFallback>
                      {review.user.name
                        .split(" ")
                        .map((n: any) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{review.user.name}</h4>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {review.date}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">{review.comment}</p>
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

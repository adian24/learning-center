import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import React from "react";

const SimilarCourse = ({ similarCourses }: any) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">More Courses by This Publisher</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {similarCourses.map((course: any) => (
          <Card key={course.id} className="overflow-hidden">
            <img
              src={course.imageUrl}
              alt={course.title}
              className="w-full h-40 object-cover"
            />
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="text-blue-600 bg-blue-50">
                  Food Safety
                </Badge>
                <span className="text-lg font-bold">${course.price}</span>
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
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SimilarCourse;

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import React from "react";

const InstructorSection = ({ courseMock }: any) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Course Instructor</h2>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4 flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-2">
                <AvatarImage
                  src={courseMock.teacher.user.image}
                  alt={courseMock.teacher.user.name}
                />
                <AvatarFallback>
                  {courseMock.teacher.user.name
                    .split(" ")
                    .map((n: any) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-medium text-center">
                {courseMock.teacher.user.name}
              </h3>
              <p className="text-sm text-gray-500 text-center">
                Doctor Scholar, Food Safety Expert
              </p>
              <div className="flex items-center mt-2">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                <span className="ml-1 text-sm">4.7 Instructor Rating</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-medium">14,382</span> Students
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-medium">7</span> Courses
              </p>
            </div>
            <div className="md:w-3/4">
              <p className="text-gray-700 mb-4">{courseMock.teacher.bio}</p>
              <div className="mb-4">
                <h4 className="font-medium mb-2">Areas of Expertise:</h4>
                <div className="flex flex-wrap gap-2">
                  {courseMock.teacher.expertise.map(
                    (item: any, index: number) => (
                      <Badge key={index} variant="secondary">
                        {item}
                      </Badge>
                    )
                  )}
                </div>
              </div>
              <Button variant="outline">View Full Profile</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorSection;

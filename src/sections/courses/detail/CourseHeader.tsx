import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Users } from "lucide-react";
import React from "react";

const CourseHeader = ({ courseMock }: any) => {
  return (
    <div className="md:w-2/3">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-blue-600 bg-blue-50">
            {courseMock.category.name}
          </Badge>
          <Badge variant="outline" className="text-green-600 bg-green-50">
            {courseMock.level === "BEGINNER"
              ? "Beginner"
              : courseMock.level === "INTERMEDIATE"
              ? "Intermediate"
              : "Advanced"}
          </Badge>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {courseMock.title}
        </h1>
        <p className="text-gray-600 mb-4">{courseMock.description}</p>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 font-medium">{courseMock.rating}</span>
            <span className="ml-1 text-gray-500">
              ({courseMock.reviewCount} reviews)
            </span>
          </div>
          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-500" />
            <span className="ml-1 text-gray-500">
              {courseMock.enrolledStudents} students
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-500" />
            <span className="ml-1 text-gray-500">
              {courseMock.duration} minutes
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
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
          <div>
            <p className="text-sm font-medium">
              {courseMock.teacher.user.name}
            </p>
            <p className="text-xs text-gray-500">Course Instructor</p>
          </div>
        </div>
      </div>

      <img
        src={courseMock.imageUrl}
        alt={courseMock.title}
        className="w-full rounded-lg object-cover mb-4 h-64 md:h-80"
      />
    </div>
  );
};

export default CourseHeader;

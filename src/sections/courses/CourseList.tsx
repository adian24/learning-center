import React from "react";
import CourseCard from "./CourseCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Grid, List, Star, Users } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StudentCourse } from "@/lib/types";

type CourseListProps = {
  courses: StudentCourse[];
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
};

const CourseList: React.FC<CourseListProps> = ({
  courses,
  view,
  onViewChange,
}) => {
  if (courses.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">
          No courses found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <Button
            variant={view === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("grid")}
            className="flex items-center"
          >
            <Grid className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewChange("list")}
            className="flex items-center"
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <ScrollArea className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Course</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="text-center">Duration</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead className="text-center">Students</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div>
                      <Link
                        href={`/courses/${course.id}`}
                        className="font-medium hover:text-blue-600 hover:underline transition-colors"
                      >
                        <div className="font-medium">{course.title}</div>
                      </Link>
                      <div className="text-sm text-gray-500 truncate max-w-[280px]">
                        {course.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{course.level}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.duration ? `${course.duration} min` : "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                      {course.rating ? course.rating.toFixed(1) : "New"}
                      {course.reviewCount > 0 && ` (${course.reviewCount})`}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Users className="h-4 w-4 mr-1" />
                      {course.enrolledCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center font-medium">
                      {formatPrice(Number(course.price))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(course.updatedAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </div>
  );
};

export default CourseList;

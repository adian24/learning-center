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
import { Calendar, Clock, Grid, List, ShieldCheck, Star } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { formatVideoDuration } from "@/utils/formatVideoDuration";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Student-specific Course type
type StudentCourse = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  level: string;
  duration?: number | null;
  totalSteps: number;
  rating?: number | null;
  reviewCount: number;
  language?: string | null;
  teacherName?: string | null;
  enrolledCount: number;
  chapterCount: number;
  updatedAt: Date;
  isEnrolled?: boolean;
};

type CourseListProps = {
  courses: StudentCourse[];
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
  showToggle?: boolean;
  showHeader?: boolean;
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
                <TableHead>Price</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center mb-0.5">
                      {course?.isEnrolled && (
                        <div className="text-green-800 flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span className="text-xs">Enrolled</span>
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/teacher/courses/${course.id}`}
                      className="font-medium hover:text-blue-600 hover:underline transition-colors flex items-center gap-2"
                    >
                      <div className="font-medium">{course.title}</div>
                    </Link>
                    <div className="text-sm text-gray-500 truncate max-w-[280px]">
                      {course.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{course.level}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatVideoDuration(course.duration as number)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                      {course.rating ? course.rating.toFixed(1) : "New"}
                      {course.reviewCount > 0 && ` (${course.reviewCount})`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center font-medium">
                      {formatPrice(course.price as number)}
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

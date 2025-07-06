"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookOpen, Calendar, Users } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { TeacherCourse } from "@/hooks/use-teacher-courses-query";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/media/SecureImage";

interface CourseListProps {
  courses: TeacherCourse[];
}

const CourseList: React.FC<CourseListProps> = ({ courses }) => {
  const t = useTranslations("courses");

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">{t("table_course")}</TableHead>
            <TableHead>{t("table_status")}</TableHead>
            <TableHead>{t("table_level")}</TableHead>
            <TableHead className="text-center">{t("table_students")}</TableHead>
            <TableHead className="text-center">{t("table_chapters")}</TableHead>
            <TableHead>{t("table_price")}</TableHead>
            <TableHead>{t("table_company")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses?.map((course) => (
            <TableRow key={course.id}>
              <TableCell>
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
                <Badge
                  className={`${
                    course.isPublished
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {course.isPublished ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{course.level}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center justify-center">
                        <Users className="h-4 w-4 mr-1" />
                        {course.enrolledCount}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {t("tooltip_students", { count: course.enrolledCount })}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="text-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center justify-center">
                        <BookOpen className="h-4 w-4 mr-1" />
                        {course.chapters.length}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {t("tooltip_chapters", {
                          count: course.chapters.length,
                        })}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {formatPrice(course.price || 0)}
                </div>
              </TableCell>
              <TableCell>
                {course.teacher?.company && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded-md">
                    {course.teacher?.company.logoUrl ? (
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          imageKey={course.teacher?.company.logoUrl}
                          userName={course.teacher?.company.name}
                          size={22}
                        />
                      </Avatar>
                    ) : (
                      <AvatarFallback className="text-xs">
                        {course.teacher?.company.name.charAt(0)}
                      </AvatarFallback>
                    )}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>{course.teacher?.company.name}</span>
                    </div>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default CourseList;

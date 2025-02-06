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
import { CourseListProps } from "@/lib/types";
import { BookOpen, Calendar, Users } from "lucide-react";
import CourseActions from "./CourseActions";

const CourseList: React.FC<CourseListProps> = ({ courses }) => {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Course</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Level</TableHead>
            <TableHead className="text-center">Siswa</TableHead>
            <TableHead className="text-center">Chapter</TableHead>
            <TableHead>Harga</TableHead>
            <TableHead>Terakhir Update</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses?.map((course) => (
            <TableRow key={course.id}>
              <TableCell>
                <div>
                  <Link
                    href={`/teacher/courses/${course.id}`}
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
                <Badge
                  className={
                    course.isPublished
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
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
                      <p>{course.enrolledCount} siswa terdaftar</p>
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
                        {course.chapters?.length}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{course.chapters?.length} chapter</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell>
                <div className="flex items-center">Rp {course.price}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(course.updatedAt).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>
                <CourseActions course={course} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default CourseList;

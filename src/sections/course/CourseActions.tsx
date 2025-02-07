"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Course } from "@/lib/types";
import { useDeleteCourseStore } from "@/store/use-delete-course-store";

interface CourseActionsProps {
  course: Course;
}

const CourseActions: React.FC<CourseActionsProps> = ({ course }) => {
  const onOpen = useDeleteCourseStore((state) => state.onOpen);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem>Publish</DropdownMenuItem>
          <DropdownMenuItem>Edit Course</DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => {
              onOpen({ id: course.id, title: course.title });
            }}
          >
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default CourseActions;

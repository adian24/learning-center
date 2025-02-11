"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeleteCourseStore } from "@/store/use-store-delete-course";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Course } from "@/lib/types";

interface DetailInfoHeaderProps {
  course: Course | undefined;
}

const DetailInfoHeader = ({ course }: DetailInfoHeaderProps) => {
  const router = useRouter();
  const onOpenDeleteDialog = useDeleteCourseStore((state) => state.onOpen);

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold line-clamp-3">{course?.title}</h1>
      </div>
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                onClick={() =>
                  onOpenDeleteDialog({
                    id: course?.id || "",
                    title: course?.title || "",
                  })
                }
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white">
              <p>Hapus Course</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Button
          form="detailCourseForm"
          className="text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Save />
          Simpan
        </Button>
      </div>
    </div>
  );
};

export default DetailInfoHeader;

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
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Course } from "@/lib/types";

interface DetailInfoHeaderProps {
  course: Course | undefined;
  isUpdating: boolean;
}

const DetailInfoHeader = ({ course, isUpdating }: DetailInfoHeaderProps) => {
  const router = useRouter();
  const onOpenDeleteDialog = useDeleteCourseStore((state) => state.onOpen);

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <Button
          variant="link"
          onClick={() => router.back()}
          className="p-0"
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
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
                type="button"
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
          type="submit"
          className="text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Membuat Course...
            </>
          ) : (
            <>
              <Save />
              Simpan
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default DetailInfoHeader;

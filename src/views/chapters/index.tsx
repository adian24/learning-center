"use client";

import Layout from "@/layout";
import { useChaptersQuery } from "@/hooks/use-chapters-query";
import { useCourseQuery } from "@/hooks/use-course-query";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  LandPlot,
  Loader2,
  PlusCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TableChapter from "@/sections/chapters/TableChapter";
import { useState } from "react";
import { useCreateChapterStore } from "@/store/use-store-create-chapter";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChaptersProps {
  courseId: string;
}

const PAGE_SIZE_OPTIONS = [
  { value: "5", label: "5 per page" },
  { value: "10", label: "10 per page" },
  { value: "25", label: "25 per page" },
  { value: "50", label: "50 per page" },
];

const Chapters = ({ courseId }: ChaptersProps) => {
  const router = useRouter();

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);

  const onOpenCreateDialog = useCreateChapterStore((state) => state.onOpen);

  const {
    data: chapters,
    isLoading,
    isFetching,
  } = useChaptersQuery({
    courseId,
    page,
    limit,
  });
  const { data: course } = useCourseQuery(courseId);

  const metadata = chapters?.metadata;

  const handleLimitChange = (value: string) => {
    setLimit(Number(value));
    setPage(1); // Reset to first page when changing limit
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl">
        <Button variant="link" onClick={() => router.back()} className="p-0">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-2xl font-bold">Course Chapters</h1>
            <p className="text-sm text-muted-foreground">
              Kelola course chapters Anda
            </p>
          </div>
          <Button
            className="text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            onClick={() => {
              onOpenCreateDialog({
                courseId: course?.id ?? "",
                courseTitle: course?.title ?? "",
              });
            }}
          >
            <PlusCircle />
            Tambah chapter
          </Button>
        </div>

        <Alert className="mt-6 bg-blue-500/10 dark:bg-blue-600/30 border-blue-300 dark:border-blue-600/70">
          <LandPlot className="h-5 w-5 !text-blue-500" />
          <AlertTitle className=" text-blue-500">Course :</AlertTitle>
          <AlertDescription className="text-blue-500 font-semibold">
            {course?.title}
          </AlertDescription>
        </Alert>

        <div className="mt-8">
          <TableChapter chapters={chapters?.chapters} />
          {isFetching && (
            <div className="flex justify-center mt-10">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Memuat Chapters...
            </div>
          )}
        </div>

        {/* Pagination */}
        {metadata && (
          <div className="flex items-center justify-between px-2 mt-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, metadata.totalChapters)} of{" "}
                {metadata.totalChapters} entries
              </div>
              <Select
                value={limit.toString()}
                onValueChange={handleLimitChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={!metadata.hasPreviousPage || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {[...Array(metadata.totalPages)].map((_, index) => (
                  <Button
                    key={index + 1}
                    variant={page === index + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(index + 1)}
                    disabled={isLoading}
                    className="min-w-[40px]"
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!metadata.hasNextPage || isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Chapters;

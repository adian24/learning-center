"use client";

import Layout from "@/layout";
import { useChaptersQuery } from "@/hooks/use-chapters-query";
import { useCourseQuery } from "@/hooks/use-course-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LandPlot, PlusCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import TableChapter from "@/sections/chapters/TableChapter";
import { useState } from "react";
import { useCreateChapterStore } from "@/store/use-store-create-chapter";
import { useRouter } from "next/navigation";

interface ChaptersProps {
  courseId: string;
}

const Chapters = ({ courseId }: ChaptersProps) => {
  const router = useRouter();

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

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

  return (
    <Layout>
      <div className="mx-auto max-w-6xl">
        <Button variant="link" onClick={() => router.back()} className="p-0">
          <ArrowLeft className="h-4 w-4 mr-2" />
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
                courseId: course?.id!,
                courseTitle: course?.title!,
              });
            }}
          >
            <PlusCircle />
            Tambah chapter
          </Button>
        </div>

        <Alert className="mt-6 bg-blue-500/10 dark:bg-blue-600/30 border-blue-300 dark:border-blue-600/70">
          <LandPlot className="h-4 w-4 !text-blue-500" />
          <AlertTitle className="font-semibold text-blue-500">
            Course :
          </AlertTitle>
          <AlertDescription className="text-blue-500">
            {course?.title}
          </AlertDescription>
        </Alert>

        <div className="mt-8">
          <TableChapter chapters={chapters?.chapters} />
        </div>
      </div>
    </Layout>
  );
};

export default Chapters;

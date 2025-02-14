'use client';

import Layout from '@/layout';
import { useChaptersQuery } from '@/hooks/use-chapters-query';
import { useCourseQuery } from '@/hooks/use-course-query';
import { Button } from '@/components/ui/button';
import { LandPlot, PlusCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import TableChapter from '@/sections/chapters/TableChapter';
import { useState } from 'react';

interface ChaptersProps {
  courseId: string;
}

const Chapters = ({ courseId }: ChaptersProps) => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const {
    data: chapters,
    isLoading,
    isFetching
  } = useChaptersQuery({
    courseId,
    page,
    limit
  });
  const { data: course } = useCourseQuery(courseId);

  return (
    <Layout>
      <div className="p-6 mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Course Chapters</h1>
            <p className="text-sm text-muted-foreground">
              Kelola course chapters Anda
            </p>
          </div>
          <Button>
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

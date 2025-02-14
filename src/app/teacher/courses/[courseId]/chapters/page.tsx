import Chapters from '@/views/chapters';

export default async function ChapterListPage({
  params
}: {
  params: { courseId: string };
}) {
  const courseId = params.courseId;

  return (
    <>
      <Chapters courseId={courseId} />
    </>
  );
}

import DialogCreateChapter from "@/sections/course/chapter/DialogCreateChapter";
import Chapters from "@/views/chapters";

interface Params {
  courseId: string;
}

export default async function ChapterListPage({ params }: { params: Params }) {
  const { courseId } = await params;

  return (
    <>
      <Chapters courseId={courseId} />
      <DialogCreateChapter />
    </>
  );
}

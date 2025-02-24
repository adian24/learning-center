import DialogCreateChapter from "@/sections/course/chapter/DialogCreateChapter";
import { DialogDeleteChapter } from "@/sections/course/chapter/DialogDeleteChapter";
import DialogEditChapter from "@/sections/course/chapter/DialogEditChapter";
import Chapters from "@/views/chapters";

type Params = Promise<{
  courseId: string;
}>;

export default async function ChapterListPage({ params }: { params: Params }) {
  const courseId = (await params).courseId;

  return (
    <>
      <Chapters courseId={courseId} />
      <DialogCreateChapter />
      <DialogEditChapter />
      <DialogDeleteChapter />
    </>
  );
}

import DialogCreateChapter from "@/sections/course/chapter/DialogCreateChapter";
import { DialogDeleteChapter } from "@/sections/course/chapter/DialogDeleteChapter";
import DialogEditChapter from "@/sections/course/chapter/DialogEditChapter";
import Chapters from "@/views/chapters";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Bab | E-Learning",
  description: "Kelola bab untuk kursus tertentu",
  keywords: ["bab", "kursus", "e-learning", "pengajar"],
};

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

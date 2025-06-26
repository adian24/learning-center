import DialogDeleteVideo from "@/sections/chapters/detail/DialogDeleteVideo";
import { DialogDeleteChapter } from "@/sections/course/chapter/DialogDeleteChapter";
import DetailChapter from "@/views/chapters/detail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail Peserta | E-Learning",
  description: "Informasi lengkap tentang peserta dan progresnya",
  keywords: ["peserta", "e-learning", "progres", "detail siswa"],
};

type Params = Promise<{
  chapterId: string;
  courseId: string;
}>;

export default async function ChapterDetail({ params }: { params: Params }) {
  const chapterId = (await params).chapterId;
  const courseId = (await params).courseId;

  return (
    <>
      <DetailChapter chapterId={chapterId} courseId={courseId} />
      <DialogDeleteChapter />
      <DialogDeleteVideo />
    </>
  );
}

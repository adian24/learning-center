import DialogCreateChapter from "@/sections/course/chapter/DialogCreateChapter";
import DialogEditChapter from "@/sections/course/chapter/DialogEditChapter";
import { DialogDeleteChapter } from "@/sections/course/chapter/DialogDeleteChapter";
import { DialogDeleteCourse } from "@/sections/course/dialog/DialogDeleteCourse";
import CourseDetail from "@/views/teacher/course-detail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail Kursus | E-Learning",
  description: "Informasi detail mengenai kursus",
  keywords: ["detail kursus", "e-learning", "pengajar"],
};

export default function CourseDetailPage() {
  return (
    <>
      <CourseDetail />
      <DialogDeleteCourse />
      <DialogCreateChapter />
      <DialogEditChapter />
      <DialogDeleteChapter />
    </>
  );
}

import DialogCreateChapter from "@/sections/course/chapter/DialogCreateChapter";
import DialogEditChapter from "@/sections/course/chapter/DialogEditChapter";
import { DialogDeleteChapter } from "@/sections/course/chapter/DialogDeleteChapter";
import { DialogDeleteCourse } from "@/sections/course/dialog/DialogDeleteCourse";
import CourseDetail from "@/views/teacher/course-detail";

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

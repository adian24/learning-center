import TeacherBuilderCourse from "@/views/teacher/builder";
import DialogCreateChapter from "@/sections/course/chapter/DialogCreateChapter";
import DialogSettingChapter from "@/sections/course/chapter/DialogSettingChapter";

export default function TeacherBuilderPage() {
  return (
    <>
      <TeacherBuilderCourse />
      <DialogCreateChapter />
      <DialogSettingChapter />
    </>
  );
}

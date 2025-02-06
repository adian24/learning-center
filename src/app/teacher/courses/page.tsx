import { DialogDeleteCourse } from "@/sections/course/dialog/DialogDeleteCourse";
import TeacherCourses from "@/views/teacher/courses";

export default function TeacherCoursesPage() {
  return (
    <>
      <TeacherCourses />
      <DialogDeleteCourse />
    </>
  );
}

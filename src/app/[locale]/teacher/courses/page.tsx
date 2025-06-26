import { DialogDeleteCourse } from "@/sections/course/dialog/DialogDeleteCourse";
import TeacherCourses from "@/views/teacher/courses";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manajemen Kursus | E-Learning",
  description: "Kelola kursus yang Anda buat",
  keywords: ["kursus", "pengajar", "e-learning"],
};

export default function TeacherCoursesPage() {
  return (
    <>
      <TeacherCourses />
      <DialogDeleteCourse />
    </>
  );
}

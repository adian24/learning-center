import CreateCourse from "@/views/teacher/courses-create";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buat Kursus Baru | E-Learning",
  description: "Formulir untuk membuat kursus e-learning",
  keywords: ["buat kursus", "e-learning", "pengajar"],
};

export default function CreateCoursePage() {
  return <CreateCourse />;
}

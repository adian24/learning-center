import CourseDetailPage from "@/views/courses/detail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detail Kursus | E-Learning",
  description: "Jelajahi kursus yang tersedia untuk pengembangan diri Anda",
  keywords: ["kursus", "e-learning", "belajar online", "katalog kursus"],
};

export default function CoursePage() {
  return <CourseDetailPage />;
}

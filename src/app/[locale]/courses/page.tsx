import Courses from "@/views/courses";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog Kursus | E-Learning",
  description: "Jelajahi kursus yang tersedia untuk pengembangan diri Anda",
  keywords: ["kursus", "e-learning", "belajar online", "katalog kursus"],
};

export default async function CoursesPage() {
  return <Courses />;
}

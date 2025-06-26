// import { Suspense } from "react";
import MyCourses from "@/views/my-course";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kursus Saya | E-Learning",
  description: "Lihat semua kursus yang Anda ikuti",
  keywords: ["kursus", "pelatihan", "e-learning", "peserta"],
};

export default async function MyCoursesPage() {
  return <MyCourses />;
}

import { Suspense } from "react";
import MyCoursePlayerPage from "@/views/my-course/player";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pemutar Kursus | E-Learning",
  description: "Belajar materi kursus melalui video interaktif",
  keywords: ["kursus", "video", "player", "belajar", "e-learning"],
};

export default function MyCoursePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyCoursePlayerPage />
    </Suspense>
  );
}

import { TeacherStudents } from "@/views/teacher";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Peserta | E-Learning",
  description: "Lihat dan kelola peserta yang Anda ajar",
  keywords: ["peserta", "pengajar", "dashboard", "e-learning"],
};

export default function TeacherStudentsPage() {
  return <TeacherStudents />;
}

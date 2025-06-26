import TeacherDashboard from "@/views/teacher/dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Pengajar | E-Learning",
  description: "Halaman utama untuk pengajar",
  keywords: ["dashboard", "pengajar", "e-learning"],
};

export default function TeacherDashboardPage() {
  return <TeacherDashboard />;
}

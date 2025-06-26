import TeacherRegistration from "@/views/teacher/register";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrasi Pengajar | E-Learning",
  description: "Formulir pendaftaran untuk menjadi pengajar",
  keywords: ["registrasi", "pengajar", "e-learning"],
};

export default function TeacherRegistrationPage() {
  return <TeacherRegistration />;
}

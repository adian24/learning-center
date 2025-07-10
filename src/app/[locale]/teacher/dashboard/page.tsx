import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { TeacherDashboard } from "@/views/teacher";

export const metadata: Metadata = {
  title: "Dashboard Pengajar | E-Learning",
  description: "Halaman utama untuk pengajar",
  keywords: ["dashboard", "pengajar", "e-learning"],
};

export default async function TeacherDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      teacherProfile: {
        select: { id: true },
      },
    },
  });

  if (!user?.teacherProfile) {
    redirect("/onboarding?step=role-selection");
  }

  return <TeacherDashboard />;
}

import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import Dashboard from "@/views/dashboard";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Peserta | E-Learning",
  description: "Your personal dashboard",
  keywords: ["dashboard", "e-learning", "peserta"],
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      studentProfile: {
        select: { id: true },
      },
    },
  });

  if (!user?.studentProfile) {
    redirect("/onboarding?step=role-selection");
  }

  return <Dashboard />;
}

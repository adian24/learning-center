import { redirect } from "next/navigation";
import { Metadata } from "next";
import Onboarding from "@/views/onboarding";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

export const metadata: Metadata = {
  title: "Onboarding | E-Learning",
  description: "Halaman onboarding User",
  keywords: ["onboarding", "pengajar", "e-learning"],
};

export default async function OnboardingPage() {
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
      studentProfile: {
        select: { id: true },
      },
    },
  });

  if (user?.teacherProfile) {
    redirect("/teacher/dashboard");
  }

  if (user?.studentProfile) {
    redirect("/dashboard");
  }

  return <Onboarding />;
}

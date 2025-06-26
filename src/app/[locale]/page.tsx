import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Landing from "@/views/landing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Landing Page | E-Learning",
  description: "Platform belajar online untuk semua kalangan",
  keywords: ["e-learning", "belajar online", "kursus", "pelatihan"],
};

const Page = async () => {
  const session = await auth();

  if (session?.user) redirect("/dashboard");

  return <Landing />;
};

export default Page;

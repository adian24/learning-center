import { Metadata } from "next";
import AllCareersView from "@/views/careers";
import SimpleLayout from "@/layout/SimpleLayout.tsx";

export const metadata: Metadata = {
  title: "Lowongan Karier | E-Learning",
  description:
    "Temukan berbagai peluang karier dari perusahaan teknologi, manajemen, dan lainnya di platform E-Learning kami.",
  keywords: [
    "lowongan kerja",
    "karier",
    "peluang kerja",
    "pekerjaan remote",
    "perusahaan teknologi",
    "e-learning",
    "fresh graduate",
    "pengembangan karier",
  ],
};

export default function CareersPage() {
  return (
    <SimpleLayout>
      <AllCareersView />
    </SimpleLayout>
  );
}

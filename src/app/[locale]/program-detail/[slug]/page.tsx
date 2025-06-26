import { Metadata } from "next";
import db from "@/lib/db/db";
import { notFound } from "next/navigation";
import SimpleLayout from "@/layout/SimpleLayout.tsx";
import ProgramDetailClient from "./program-detail";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const program = await db.course.findUnique({
    where: { id: params.slug },
  });

  if (!program) {
    return {
      title: "Program Tidak Ditemukan | E-Learning",
      description: "Program yang Anda cari tidak tersedia.",
      keywords: ["program tidak ditemukan", "kursus", "e-learning"],
    };
  }

  return {
    title: `${program.title} | E-Learning`,
    description:
      program.description ?? `Pelajari lebih lanjut tentang ${program.title}.`,
    keywords: [
      program.title ?? "",
      "kursus online",
      "e-learning",
      "program pelatihan",
    ],
  };
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const program = await db.course.findUnique({
    where: { id: params.slug },
  });

  if (!program) return notFound();

  return (
    <SimpleLayout>
      <ProgramDetailClient />
    </SimpleLayout>
  );
}

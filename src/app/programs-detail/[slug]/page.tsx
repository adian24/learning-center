"use client";

import { useAllCourses } from "@/hooks/use-courses";
import ProgramsDetailView from "@/views/programs/programs-detail";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import SimpleLayout from "@/layout/SimpleLayout.tsx";

export default function ProgramsDetailPage() {
  const params = useParams();
  const courseId = params?.slug as string;

  const { data, isLoading, error } = useAllCourses();
  const courses = data?.courses;

  const programs = courses?.find(
    (item: { id: string }) => item.id === courseId
  );

  if (isLoading) {
    return (
      <SimpleLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-sky-500" />
          <span className="ml-4 text-sky-600 font-medium">
            Loading course details...
          </span>
        </div>
      </SimpleLayout>
    );
  }

  if (!programs) {
    return (
      <SimpleLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 text-center"
        >
          <p className="text-xl font-semibold text-gray-600">
            Program tidak ditemukan 🧐
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Mohon periksa kembali link kursus yang Anda akses.
          </p>
        </motion.div>
      </SimpleLayout>
    );
  }

  return (
    <SimpleLayout>
      <ProgramsDetailView programs={programs} />
    </SimpleLayout>
  );
}

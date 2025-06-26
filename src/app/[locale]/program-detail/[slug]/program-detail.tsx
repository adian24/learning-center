"use client";

import { useAllCourses } from "@/hooks/use-courses";
import ProgramDetailView from "@/views/programs/program-detail";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function ProgramDetailClient() {
  const t = useTranslations();
  const params = useParams();
  const courseId = params?.slug as string;

  const { data, isLoading, error } = useAllCourses();
  const courses = data?.courses;

  const programs = courses?.find(
    (item: { id: string }) => item.id === courseId
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-sky-500" />
        <span className="ml-4 text-sky-600 font-medium">
          {t("loading_course_detail")}
        </span>
      </div>
    );
  }

  if (!programs) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-10 text-center"
      >
        <p className="text-xl font-semibold text-gray-600">
          {t("not_found.title")}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {t("not_found.subtitle")}
        </p>
      </motion.div>
    );
  }

  return <ProgramDetailView programs={programs} />;
}

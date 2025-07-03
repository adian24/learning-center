"use client";

import { useAllCourses } from "@/hooks/use-courses";
import ProgramDetailView from "@/views/programs/program-detail";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import ProgramDetailShimmer from "@/views/programs/program-detail/program-detail-shimmer";

export default function ProgramDetailClient() {
  const t = useTranslations("landing");
  const params = useParams();
  const courseId = params?.slug as string;

  const { data, isLoading, error } = useAllCourses();
  const courses = data?.courses;

  const programs = courses?.find(
    (item: { id: string }) => item.id === courseId
  );

  if (isLoading) {
    return <ProgramDetailShimmer />;
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

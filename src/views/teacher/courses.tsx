"use client";

import ButtonNvigation from "@/components/button-navigation";
import { useTeacherCoursesQuery } from "@/hooks/use-teacher-courses-query";
import Layout from "@/layout";
import CourseCard from "@/sections/course/CourseCard";
import CourseFilter from "@/sections/course/CourseFilter";
import CourseList from "@/sections/course/CourseList";
import CoursePagination, {
  generatePaginationItems,
} from "@/sections/course/CoursePagination";
import TeacherEmptyCourse from "@/sections/teacher/TeacherEmptyCourse";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, useState } from "react";

export default function TeacherCourses() {
  const t = useTranslations("teacher_courses");

  const [viewType, setViewType] = useState<"grid" | "list">("list");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data, isLoading, error } = useTeacherCoursesQuery({
    page,
    perPage,
  });

  const courses = data?.courses ?? [];
  const totalPages = data?.meta.totalPages || 1;
  const paginationItems = generatePaginationItems(page, totalPages);

  const hasCourses = courses.length > 0;

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center min-h-[200px]">
          <p className="text-red-500">{t("error_loading")}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Top Navigation */}
      <div className="bg-white shadow-sm">
        <div className="flex justify-between items-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-16">
            <h1 className="text-lg font-bold sm:text-xl md:text-2xl">
              {t("my_courses")}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {t("course_subtitle")}
            </p>
          </div>

          {hasCourses && (
            <ButtonNvigation
              text={t("button_create_course")}
              url="/teacher/courses/create"
              className="text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="h-full flex items-center justify-center min-h-[200px]">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p>{t("loading")}</p>
            </div>
          </div>
        ) : hasCourses ? (
          <Fragment>
            {/* Filters */}
            <CourseFilter viewType={viewType} setViewType={setViewType} />

            {/* Course Content */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {viewType === "grid" &&
                data?.courses?.map((course) => (
                  <CourseCard course={course} key={course.id} />
                ))}
            </div>

            {viewType === "list" && (
              <CourseList courses={data?.courses ?? []} />
            )}

            {/* Pagination */}
            <CoursePagination
              page={page}
              setPage={setPage}
              totalPages={totalPages}
              paginationItems={paginationItems}
            />
          </Fragment>
        ) : (
          <Fragment>
            {/* Empty State Card */}
            <TeacherEmptyCourse />
          </Fragment>
        )}
      </div>
    </Layout>
  );
}

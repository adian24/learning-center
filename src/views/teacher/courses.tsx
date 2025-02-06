"use client";

import ButtonNvigation from "@/components/button-navigation";
import { useCoursesQuery } from "@/hooks/use-courses-query";
import Layout from "@/layout";
import CourseCard from "@/sections/course/CourseCard";
import CourseFilter from "@/sections/course/CourseFilter";
import CourseList from "@/sections/course/CourseList";
import CoursePagination, {
  generatePaginationItems,
} from "@/sections/course/CoursePagination";
import TeacherEmptyCourse from "@/sections/teacher/TeacherEmptyCourse";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function TeacherCourses() {
  const [viewType, setViewType] = useState<"grid" | "list">("list");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data, isLoading, error } = useCoursesQuery({
    page,
    perPage,
  });

  const totalPages = data?.meta.totalPages || 1;
  const paginationItems = generatePaginationItems(page, totalPages);

  if (isLoading) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center min-h-[200px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Loading courses...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center min-h-[200px]">
          <p className="text-red-500">
            Something went wrong. Please try again later.
          </p>
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
              Courses
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Kelola dan buat kursus Anda
            </p>
          </div>

          {(data?.courses?.length ?? 0) > 0 && (
            <ButtonNvigation
              text="Buat Course Baru"
              url="/teacher/courses/create"
              className="text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Empty State Card */}
        {(data?.courses?.length ?? 0) === 0 && <TeacherEmptyCourse />}

        {/* Filters */}
        {(data?.courses?.length ?? 0) > 0 && (
          <CourseFilter viewType={viewType} setViewType={setViewType} />
        )}

        {/* Course Content */}
        {(data?.courses?.length ?? 0) > 0 && (
          <>
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
          </>
        )}
      </div>
    </Layout>
  );
}

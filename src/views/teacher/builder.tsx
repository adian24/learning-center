"use client";

import { useEffect, useState } from "react";
import { useCoursesQuery } from "@/hooks/use-courses-query";

import Layout from "@/layout";
import CourseList from "@/sections/teacher/builder/CourseList";
``;
import CourseDetail from "@/sections/teacher/builder/CourseDetail";

export default function TeacherCourseBuilder() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | number>(0);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data, isLoading } = useCoursesQuery({
    page,
    perPage,
  });

  useEffect(() => {
    if (data) {
      if (data?.courses?.length > 0 && !selectedCourseId) {
        setTimeout(() => {
          setSelectedCourseId(data?.courses[0].id);
        }, 0);
      }
    }
  }, [data?.courses]);

  const handleCourseSelect = (courseId: string | number) => {
    if (courseId !== selectedCourseId) {
      setSelectedCourseId(courseId);
    }
  };

  return (
    <Layout>
      {/* Top Navigation */}
      <div className="bg-white shadow-sm">
        <div className="flex justify-between items-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-16">
            <h1 className="text-lg font-bold sm:text-xl md:text-2xl">
              Course Builder
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Kelola dan tambahkan konten untuk Course Anda
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-full">
          <div className="grid grid-cols-12 gap-4 p-6">
            <div className="col-span-6 bg-white rounded-lg shadow">
              <CourseList
                courses={data?.courses}
                isLoading={isLoading}
                selectedId={selectedCourseId}
                onSelect={handleCourseSelect}
              />
            </div>
            <div className="col-span-6 bg-white rounded-lg shadow">
              {typeof selectedCourseId === "string" && (
                <CourseDetail courseId={selectedCourseId} />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

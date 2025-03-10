"use client";

import HeroFormSignUpForm from "@/components/hero";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourses } from "@/hooks/use-courses";
import SimpleLayout from "@/layout/SimpleLayout.tsx";
import CourseCard from "@/sections/courses/CourseCard";
import { useRouter } from "next/navigation";
import React from "react";

const Landing = () => {
  const router = useRouter();

  const filters = {
    search: "",
    category: "",
    level: "",
    language: "",
    minPrice: 0,
    maxPrice: 1000,
    minRating: 0,
  };

  const { data, isLoading, error } = useCourses(filters);

  return (
    <SimpleLayout>
      <div className="pb-10">
        <HeroFormSignUpForm />

        <div className="container max-w-7xl mx-auto p-8 md:p-0">
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-lg font-bold sm:text-xl md:text-2xl">
              Course terbaru
            </h1>
            <Button
              variant="link"
              size={"sm"}
              type="button"
              className="underline text-blue-600 hover:text-blue-900"
              onClick={() => router.push(`/courses`)}
            >
              Lihat semua Courses
            </Button>
          </div>
          {isLoading ? (
            <CoursesLoading />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data?.courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </SimpleLayout>
  );
};

export default Landing;

const CoursesLoading = () => (
  <div className="space-y-4">
    <div className="container max-w-7xl mx-auto">
      <div className="mb-8">
        <Skeleton className="h-10 w-1/3 mb-2" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <Skeleton className="h-12 w-full mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

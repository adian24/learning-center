"use client";

import HeroFormSignUpForm from "@/components/hero";
import { Button } from "@/components/ui/button";
import { useCourses } from "@/hooks/use-courses";
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data?.courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;

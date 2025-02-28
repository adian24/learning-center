"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useCourses, CourseFilters as FiltersType } from "@/hooks/use-courses";
import Layout from "@/layout";
import CourseFilters from "@/sections/courses/CourseFilters";
import CourseList from "@/sections/courses/CourseList";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const Courses = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize filters from URL search params
  const [filters, setFilters] = useState<FiltersType>({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    level: searchParams.get("level") || "",
    language: searchParams.get("language") || "",
    minPrice: Number(searchParams.get("minPrice") || 0),
    maxPrice: Number(searchParams.get("maxPrice") || 1000),
    minRating: Number(searchParams.get("minRating") || 0),
  });

  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const savedView = localStorage.getItem("courseViewPreference");
    if (savedView === "grid" || savedView === "list") {
      setView(savedView);
    }
  }, []);

  const { data, isLoading, error } = useCourses(filters);

  const handleFilterChange = (newFilters: FiltersType) => {
    setFilters(newFilters);

    // Update URL search params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (
        value !== "" &&
        value !== 0 &&
        !(key === "maxPrice" && value === 1000)
      ) {
        params.set(key, String(value));
      }
    });

    // Update URL without causing a reload
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleViewChange = (newView: "grid" | "list") => {
    setView(newView);
    localStorage.setItem("courseViewPreference", newView);
  };

  console.log("DATA Courses : ", data?.courses);

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Explore Courses</h1>
          <p className="text-gray-500">
            Discover courses to enhance your skills and knowledge
          </p>
        </div>

        {/* Filters */}
        <CourseFilters
          categories={data?.categories || []}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Error state */}
        {error && (
          <div className="text-center py-10">
            <p className="text-red-500">
              An error occurred while loading courses. Please try again.
            </p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
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
        )}

        {/* Course list */}
        {!isLoading && data && (
          <>
            <div className="mb-4 text-sm text-gray-500">
              Showing {data.courses.length} courses
            </div>

            <CourseList
              courses={data?.courses}
              view={view}
              onViewChange={handleViewChange}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default Courses;

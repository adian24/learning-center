"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourses, CourseFilters as FiltersType } from "@/hooks/use-courses";
import CourseFilters from "./CourseFilters";
import CourseList from "./CourseList";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FilterIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CoursesClient() {
  const t = useTranslations("courses");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

  // Get view preference from local storage or default to grid
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const savedView = localStorage.getItem("courseViewPreference");
    if (savedView === "grid" || savedView === "list") {
      setView(savedView);
    }
  }, []);

  // Fetch courses based on filters
  const { data, isLoading, error } = useCourses(filters);

  // Update URL when filters change
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

  // Handle view toggle
  const handleViewChange = (newView: "grid" | "list") => {
    setView(newView);
    localStorage.setItem("courseViewPreference", newView);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("explore_courses")}</h1>
        <p className="text-gray-500">{t("explore_description")}</p>
      </div>

      {/* Main content layout with sidebar */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Mobile filter toggle button */}
        <div className="lg:hidden mb-4">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center w-full justify-between"
              >
                <span>{t("filters")}</span>
                <FilterIcon className="h-4 w-4 ml-2" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="py-4">
                <CourseFilters
                  categories={data?.categories || []}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  variant="drawer"
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop sidebar filters */}
        <div className="hidden lg:block shrink-0">
          <div className="bg-white dark:bg-gray-950 rounded-lg border p-4 sticky top-20">
            <h3 className="font-medium text-lg mb-4">{t("filters_title")}</h3>
            {isLoading ? (
              <FiltersSkeleton />
            ) : (
              <CourseFilters
                categories={data?.categories || []}
                filters={filters}
                onFilterChange={handleFilterChange}
                variant="sidebar"
              />
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1">
          {/* Error state */}
          {error && (
            <div className="text-center py-10">
              <p className="text-red-500">{t("error_loading")}</p>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="space-y-4">
              {/* Course card skeleton layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <CourseCardSkeleton key={index} />
                ))}
              </div>
            </div>
          )}

          {/* Course list */}
          {!isLoading &&
            data &&
            (data.courses.length > 0 ? (
              <CourseList
                courses={data.courses}
                view={view}
                onViewChange={handleViewChange}
                showToggle={false}
              />
            ) : (
              <div className="flex justify-center items-center">
                <div className="bg-white dark:bg-gray-950 rounded-lg shadow-sm p-8 max-w-md w-full text-center">
                  <div className="mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 mx-auto text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t("empty_title")}</h3>
                  <p className="text-gray-500 mb-4">{t("empty_description")}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

const FiltersSkeleton = () => {
  return (
    <div className="space-y-6 w-full">
      {/* Search Skeleton */}
      <div className="space-y-2 w-full">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Category Skeleton */}
      <div className="space-y-2 w-full">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Level Skeleton */}
      <div className="space-y-2 w-full">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Language Skeleton */}
      <div className="space-y-2 w-full">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Price Range Skeleton */}
      <div className="space-y-2 w-full">
        <div className="flex justify-between w-full">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="my-6 py-1 w-full">
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      {/* Rating Skeleton */}
      <div className="space-y-3 w-full">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-1 w-full">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-5 w-5 rounded-full flex-shrink-0" />
          ))}
        </div>
      </div>
    </div>
  );
};

const CourseCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-950 border rounded-lg overflow-hidden flex flex-col h-full shadow-sm">
      {/* Image skeleton */}
      <div className="relative">
        <Skeleton className="h-48 w-full" />
        {/* Category badge skeleton */}
        <div className="absolute top-3 left-3">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>

      {/* Card content skeleton */}
      <div className="p-5 space-y-4 flex-1 flex flex-col">
        {/* Title skeleton */}
        <div>
          <Skeleton className="h-6 w-5/6 mb-1" />
          <Skeleton className="h-6 w-4/6" />
        </div>

        {/* Description skeleton */}
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Instructor skeleton */}
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Footer skeleton */}
        <div className="flex justify-between items-center pt-2 mt-auto">
          {/* Price skeleton */}
          <Skeleton className="h-6 w-20 font-bold" />
          {/* Rating skeleton */}
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
};

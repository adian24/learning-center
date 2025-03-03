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

export default function CoursesClient() {
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
    <div className="container max-w-max mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Explore Courses</h1>
        <p className="text-gray-500">
          Discover courses to enhance your skills and knowledge
        </p>
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
                <span>Filters</span>
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
        <div className="hidden lg:block lg:w-1/5 shrink-0">
          <div className="bg-white dark:bg-gray-950 rounded-lg border p-4 sticky top-20">
            <h3 className="font-medium text-lg mb-4">Filters</h3>
            <CourseFilters
              categories={data?.categories || []}
              filters={filters}
              onFilterChange={handleFilterChange}
              variant="sidebar"
            />
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1">
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
                  <div
                    key={index}
                    className="border rounded-lg overflow-hidden"
                  >
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
            <CourseList
              courses={data.courses}
              view={view}
              onViewChange={handleViewChange}
              showToggle={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}

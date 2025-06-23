import { StudentCourse } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export type CourseFilters = {
  search: string;
  category: string;
  level: string;
  language: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
};

type Category = {
  id: string;
  name: string;
};

type CoursesResponse = {
  courses: StudentCourse[];
  categories: Category[];
};

export const useCourses = (filters: CourseFilters) => {
  // Build query string based on filters
  const queryString = Object.entries(filters)
    .filter(
      ([_, value]) => value !== "" && value !== undefined && value !== null
    )
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return useQuery<CoursesResponse>({
    queryKey: ["courses", filters],
    queryFn: async () => {
      const response = await fetch(`/api/courses?${queryString}`);

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      return response.json();
    },
  });
};

export const useAllCourses = () => {
  return useQuery<CoursesResponse>({
    queryKey: ["allCourses"],
    queryFn: async () => {
      const response = await fetch(`/api/courses`);

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      return response.json();
    },
  });
};

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      return response.json();
    },
  });
};

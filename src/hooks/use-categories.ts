// hooks/use-categories.ts
import { useQuery } from "@tanstack/react-query";

interface Category {
  id: string;
  name: string;
  slug: string;
}

async function getCategories(): Promise<Category[]> {
  const response = await fetch("/api/teacher/courses/categories");
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}

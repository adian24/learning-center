import { useQuery } from "@tanstack/react-query";
import { PaginatedResponse, PaginationParams } from "@/lib/types";

async function fetchCourses(
  params: PaginationParams
): Promise<PaginatedResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.perPage) searchParams.set("perPage", params.perPage.toString());

  const response = await fetch(`/api/courses?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }
  return response.json();
}

export function useCoursesQuery(
  params: PaginationParams = { page: 1, perPage: 10 }
) {
  return useQuery({
    queryKey: ["courses", params],
    queryFn: () => fetchCourses(params),
  });
}

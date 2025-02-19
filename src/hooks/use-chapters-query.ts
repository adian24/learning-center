// hooks/use-chapters-query.ts
import { Chapter } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

interface PaginatedChaptersResponse {
  chapters: Chapter[];
  metadata: {
    totalChapters: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface ChapterQueryParams {
  courseId: string;
  page?: number;
  limit?: number;
  search?: string;
}

const fetchChapters = async ({
  courseId,
  page = 1,
  limit = 10,
  search = "",
}: ChapterQueryParams): Promise<PaginatedChaptersResponse> => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search: search,
  });

  const response = await fetch(
    `/api/teacher/courses/${courseId}/chapters?${queryParams.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch chapters");
  }

  return response.json();
};

export const useChaptersQuery = ({
  courseId,
  page,
  limit,
  search,
}: ChapterQueryParams) => {
  return useQuery({
    queryKey: ["chapters", courseId, page, limit, search],
    queryFn: () => fetchChapters({ courseId, page, limit, search }),
    // placeholderData: true // Keeps the previous data while fetching new data
  });
};

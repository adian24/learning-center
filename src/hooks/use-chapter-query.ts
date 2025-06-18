import { useQuery } from "@tanstack/react-query";
import { ChapterWithProgress } from "../lib/types/chapter";

interface UseChapterQuery {
  courseId: string;
  chapterId: string;
}

async function getChapter(
  courseId: string,
  chapterId: string
): Promise<ChapterWithProgress> {
  const response = await fetch(
    `/api/teacher/courses/${courseId}/chapters/${chapterId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch chapter");
  }

  return response.json();
}

export function useChapterQuery({ courseId, chapterId }: UseChapterQuery) {
  return useQuery({
    queryKey: ["chapter", courseId, chapterId],
    queryFn: () => getChapter(courseId, chapterId),
    enabled: !!courseId && !!chapterId,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 2, // Retry failed requests twice
  });
}

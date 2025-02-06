import { Course } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const fetchCourse = async (courseId: string): Promise<Course> => {
  const response = await fetch(`/api/courses/${courseId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch course");
  }
  return response.json();
};

export const useCourseQuery = (courseId: string) => {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: () => fetchCourse(courseId),
  });
};

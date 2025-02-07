import { Course } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

const fetchCourse = async (courseId: string): Promise<Course> => {
  const response = await fetch(`/api/teacher/courses/${courseId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch course");
  }
  return response.json();
};

export const useCourseQuery = (courseId: string) => {
  return useQuery({
    queryKey: ["teacher-course", courseId],
    queryFn: () => fetchCourse(courseId),
  });
};

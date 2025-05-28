import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CourseFormValues } from "@/lib/validations/courses";

export const useUpdateCourse = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CourseFormValues) => {
      console.log("Sending data to API:", data);
      console.log("API endpoint:", `/api/teacher/courses/${courseId}`);

      const response = await fetch(`/api/teacher/courses/${courseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error:", errorData);
        throw new Error("Failed to update course");
      }

      const result = await response.json();
      console.log("API Response:", result);
      return result;
    },
    onSuccess: () => {
      toast.success("Course updated successfully");
      queryClient.invalidateQueries({ queryKey: ["teacher-course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
      queryClient.invalidateQueries({ queryKey: ["teacherCourses"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to update course");
      console.error("[UPDATE_COURSE_ERROR]", error);
    },
  });
};

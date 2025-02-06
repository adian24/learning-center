import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CourseFormValues } from "@/lib/validations/courses";

export const useUpdateCourse = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CourseFormValues) => {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update course");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Course updated successfully");
      queryClient.invalidateQueries({ queryKey: ["teacher-course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["teacher-courses"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to update course");
      console.error("[UPDATE_COURSE_ERROR]", error);
    },
  });
};

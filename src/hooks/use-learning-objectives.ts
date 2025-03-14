// src/hooks/use-learning-objectives.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { UpdateLearningObjectiveParams } from "@/lib/types";
import { toast } from "sonner";

// Function to fetch learning objectives for a course
const fetchLearningObjectives = async (courseId: string) => {
  const response = await axios.get(
    `/api/courses/${courseId}/learning-objectives`
  );
  return response.data.learningObjectives;
};

// Function to create a learning objective
const createLearningObjective = async ({
  courseId,
  objectives,
}: {
  courseId: string;
  objectives: { text: string }[] | { text: string };
}) => {
  const response = await axios.post(
    `/api/courses/${courseId}/learning-objectives`,
    objectives
  );
  return response.data.learningObjective;
};

// Function to update a learning objective
const updateLearningObjective = async ({
  objectiveId,
  data,
}: {
  objectiveId: string;
  data: UpdateLearningObjectiveParams;
}) => {
  const response = await axios.patch(
    `/api/learning-objectives/${objectiveId}`,
    data
  );
  return response.data.learningObjective;
};

// Function to reorder learning objectives
const reorderLearningObjectives = async ({
  courseId,
  orderedIds,
}: {
  courseId: string;
  orderedIds: string[];
}) => {
  const response = await axios.post(
    `/api/courses/${courseId}/learning-objectives/reorder`,
    {
      orderedIds,
    }
  );
  return response.data;
};

// Hook to get learning objectives
export const useLearningObjectives = (courseId: string) => {
  return useQuery({
    queryKey: ["learningObjectives", courseId],
    queryFn: () => fetchLearningObjectives(courseId),
    enabled: !!courseId,
  });
};

// Hook to create a learning objective
export const useCreateLearningObjective = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLearningObjective,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["learningObjectives", variables.courseId],
      });

      const objectCount = Array.isArray(data) ? data.length : 1;
      const message =
        objectCount > 1
          ? `${objectCount} learning objectives added`
          : "Learning objective added";

      toast.success(message);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to add learning objectives");
    },
  });
};

// Hook to update a learning objective
export const useUpdateLearningObjective = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLearningObjective,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["learningObjectives", courseId],
      });
      toast.success("Learning objective updated");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to update learning objective");
    },
  });
};

// Hook to delete a learning objective
export const useDeleteLearningObjective = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { objectiveId: string }) => {
      const response = await axios.delete(
        `/api/courses/${courseId}/learning-objectives/${data.objectiveId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["learningObjectives", courseId],
      });
      toast.success("Learning objective deleted");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete learning objective");
    },
  });
};

// Hook to reorder learning objectives
export const useReorderLearningObjectives = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderLearningObjectives,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["learningObjectives", courseId],
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to reorder learning objectives");
    },
  });
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ResourcesResponse,
  ResourceWithChapter,
  CreateResourceRequest,
  UpdateResourceRequest,
  ResourceFilters,
} from "@/lib/types/";

async function updateResource(resourceId: string, data: UpdateResourceRequest) {
  const response = await fetch(`/api/teacher/resources/${resourceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error("Update Resource API Error:", errorData);
    throw new Error("Failed to update resource");
  }

  return response.json();
}

// Hook to fetch resources list
export const useResources = (filters: ResourceFilters = {}) => {
  // Build query string from filters
  const queryString = Object.entries(filters)
    .filter(
      ([_, value]) => value !== undefined && value !== null && value !== ""
    )
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return useQuery<ResourcesResponse>({
    queryKey: ["teacher-resources", filters],
    queryFn: async () => {
      const url = `/api/teacher/resources${
        queryString ? `?${queryString}` : ""
      }`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }

      return response.json();
    },
  });
};

// Hook to fetch single resource
export const useResource = (resourceId: string | undefined) => {
  return useQuery<ResourceWithChapter>({
    queryKey: ["teacher-resource", resourceId],
    queryFn: async () => {
      if (!resourceId) {
        throw new Error("Resource ID is required");
      }

      const response = await fetch(`/api/teacher/resources/${resourceId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch resource");
      }

      return response.json();
    },
    enabled: !!resourceId,
  });
};

// Hook to fetch list resource for student
export const useStudentResources = (
  chapterId: string,
  page = 1,
  perPage = 10
) => {
  const params = new URLSearchParams({
    chapterId,
    page: page.toString(),
    perPage: perPage.toString(),
  });

  return useQuery<ResourcesResponse>({
    queryKey: ["student-resources", chapterId],
    queryFn: async () => {
      const url = `/api/student/resources${params ? `?${params}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }

      return response.json();
    },
    enabled: !!chapterId,
  });
};

// Hook to fetch single resource for student
export const useStudentResource = (resourceId: string) => {
  return useQuery<ResourceWithChapter>({
    queryKey: ["student-resource", resourceId],
    queryFn: async () => {
      if (!resourceId) {
        throw new Error("Resource ID is required");
      }

      const response = await fetch(`/api/student/resources/${resourceId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch resource");
      }

      return response.json();
    },
    enabled: !!resourceId,
  });
};

// Hook to create new resource
export const useCreateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateResourceRequest) => {
      console.log("Creating resource:", data);

      const response = await fetch("/api/teacher/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Create Resource API Error:", errorData);
        throw new Error("Failed to create resource");
      }

      const result = await response.json();
      console.log("Create Resource API Response:", result);
      return result;
    },
    onSuccess: (data) => {
      toast.success("Article created successfully");

      // Invalidate and refetch resources list
      queryClient.invalidateQueries({ queryKey: ["teacher-resources"] });

      // If we have chapter info, also invalidate chapter-specific queries
      if (data.chapter?.id) {
        queryClient.invalidateQueries({
          queryKey: ["teacher-resources", { chapterId: data.chapter.id }],
        });
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to create article");
      console.error("[CREATE_RESOURCE_ERROR]", error);
    },
  });
};

// Hook to update resource
export const useUpdateResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      resourceId,
      data,
    }: {
      resourceId: string;
      data: UpdateResourceRequest;
    }) => updateResource(resourceId, data),
    onSuccess: (data) => {
      toast.success("Article updated successfully");

      // Invalidate specific resource query
      queryClient.invalidateQueries({
        queryKey: ["teacher-resource", data.id],
      });

      // Invalidate resources list
      queryClient.invalidateQueries({ queryKey: ["teacher-resources"] });

      // If we have chapter info, also invalidate chapter-specific queries
      if (data.chapter?.id) {
        queryClient.invalidateQueries({
          queryKey: ["teacher-resources", { chapterId: data.chapter.id }],
        });
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to update article");
      console.error("[UPDATE_RESOURCE_ERROR]", error);
    },
  });
};

// Hook to delete resource
export const useDeleteResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resourceId: string) => {
      console.log("Deleting resource:", resourceId);

      const response = await fetch(`/api/teacher/resources/${resourceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Delete Resource API Error:", errorData);
        throw new Error("Failed to delete resource");
      }

      return { resourceId };
    },
    onSuccess: (data) => {
      toast.success("Article deleted successfully");

      // Invalidate specific resource query
      queryClient.invalidateQueries({
        queryKey: ["teacher-resource", data.resourceId],
      });

      // Invalidate resources list
      queryClient.invalidateQueries({ queryKey: ["teacher-resources"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete article");
      console.error("[DELETE_RESOURCE_ERROR]", error);
    },
  });
};

// Hook to get resources by chapter
export const useResourcesByChapter = (chapterId: string | undefined) => {
  return useResources({ chapterId });
};

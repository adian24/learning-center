// src/hooks/use-secure-media.ts
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

// Types
interface SecureImageResponse {
  url: string;
  expiresIn: number;
}

interface SecureVideoResponse {
  url: string;
  expiresIn: number;
  chapterTitle?: string;
  duration?: number;
}

// Utility function to check if URL needs refresh (expires in 5 minutes)
const needsRefresh = (expiresAt: number) => {
  const now = Date.now();
  const timeUntilExpiry = expiresAt - now;
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
  return timeUntilExpiry <= fiveMinutes;
};

/**
 * Hook to get secure image URLs with automatic refresh
 * @param key - S3 key for the image
 * @param courseId - Optional course ID for access verification
 * @param enabled - Whether the query should be enabled
 */
export const useSecureImage = (
  key: string | null | undefined,
  courseId?: string,
  enabled = true
) => {
  const [cachedData, setCachedData] = useState<{
    url: string;
    expiresAt: number;
  } | null>(null);

  const shouldFetch = Boolean(
    enabled && key && (!cachedData || needsRefresh(cachedData.expiresAt))
  );

  const { data, isLoading, error, refetch, isRefetching } =
    useQuery<SecureImageResponse>({
      queryKey: ["secure-image", key, courseId],
      queryFn: async () => {
        if (!key) throw new Error("Image key is required");

        const params = new URLSearchParams({ key });
        if (courseId) {
          params.append("courseId", courseId);
        }

        const response = await fetch(`/api/secure/image?${params.toString()}`);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to get secure image URL");
        }

        return response.json();
      },
      enabled: Boolean(shouldFetch),
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 0, // Always consider stale to check expiry
      refetchOnWindowFocus: false,
    });

  // Update cached data when new data arrives
  useEffect(() => {
    if (data) {
      setCachedData({
        url: data.url,
        expiresAt: Date.now() + data.expiresIn * 1000,
      });
    }
  }, [data]);

  // Auto-refresh logic
  useEffect(() => {
    if (!cachedData) return;

    const timeUntilRefresh = cachedData.expiresAt - Date.now() - 5 * 60 * 1000; // Refresh 5 minutes before expiry

    if (timeUntilRefresh <= 0) {
      refetch();
      return;
    }

    const timeout = setTimeout(() => {
      refetch();
    }, timeUntilRefresh);

    return () => clearTimeout(timeout);
  }, [cachedData, refetch]);

  return {
    imageUrl: cachedData?.url || null,
    isLoading: isLoading || isRefetching,
    error,
    refetch,
    isExpired: cachedData ? needsRefresh(cachedData.expiresAt) : false,
  };
};

/**
 * Hook to get secure video URLs with automatic refresh
 * @param key - S3 key for the video
 * @param chapterId - Chapter ID for access verification (required)
 * @param enabled - Whether the query should be enabled
 */
export const useSecureVideo = (
  key: string | null | undefined,
  chapterId: string | null | undefined,
  enabled = true
) => {
  const [cachedData, setCachedData] = useState<{
    url: string;
    expiresAt: number;
    chapterTitle?: string;
    duration?: number;
  } | null>(null);

  const shouldFetch = Boolean(
    enabled &&
      key &&
      chapterId &&
      (!cachedData || needsRefresh(cachedData.expiresAt))
  );

  const { data, isLoading, error, refetch, isRefetching } =
    useQuery<SecureVideoResponse>({
      queryKey: ["secure-video", key, chapterId],
      queryFn: async () => {
        if (!key) throw new Error("Video key is required");
        if (!chapterId) throw new Error("Chapter ID is required");

        const params = new URLSearchParams({ key, chapterId });
        const response = await fetch(`/api/secure/video?${params.toString()}`);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to get secure video URL");
        }

        return response.json();
      },
      enabled: shouldFetch,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 0, // Always consider stale to check expiry
      refetchOnWindowFocus: false,
    });

  // Update cached data when new data arrives
  useEffect(() => {
    if (data) {
      setCachedData({
        url: data.url,
        expiresAt: Date.now() + data.expiresIn * 1000,
        chapterTitle: data.chapterTitle,
        duration: data.duration,
      });
    }
  }, [data]);

  // Auto-refresh logic
  useEffect(() => {
    if (!cachedData) return;

    const timeUntilRefresh = cachedData.expiresAt - Date.now() - 5 * 60 * 1000; // Refresh 5 minutes before expiry

    if (timeUntilRefresh <= 0) {
      refetch();
      return;
    }

    const timeout = setTimeout(() => {
      refetch();
    }, timeUntilRefresh);

    return () => clearTimeout(timeout);
  }, [cachedData, refetch]);

  return {
    videoUrl: cachedData?.url || null,
    chapterTitle: cachedData?.chapterTitle,
    duration: cachedData?.duration,
    isLoading: isLoading || isRefetching,
    error,
    refetch,
    isExpired: cachedData ? needsRefresh(cachedData.expiresAt) : false,
  };
};

/**
 * Helper hook for batch loading multiple secure images
 * Useful for course cards, galleries, etc.
 */
export const useSecureImages = (
  imageKeys: Array<{ key: string; courseId?: string }>,
  enabled = true
) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!enabled || imageKeys.length === 0) return;

    const loadImages = async () => {
      // Initialize loading states
      const initialLoadingState: Record<string, boolean> = {};
      imageKeys.forEach(({ key }) => {
        initialLoadingState[key] = true;
      });
      setLoadingStates(initialLoadingState);

      // Load images in parallel
      const promises = imageKeys.map(async ({ key, courseId }) => {
        try {
          const params = new URLSearchParams({ key });
          if (courseId) {
            params.append("courseId", courseId);
          }

          const response = await fetch(
            `/api/secure/image?${params.toString()}`
          );

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to load image");
          }

          const data: SecureImageResponse = await response.json();

          setImageUrls((prev) => ({ ...prev, [key]: data.url }));
          setLoadingStates((prev) => ({ ...prev, [key]: false }));
        } catch (error) {
          setErrors((prev) => ({
            ...prev,
            [key]:
              error instanceof Error ? error.message : "Failed to load image",
          }));
          setLoadingStates((prev) => ({ ...prev, [key]: false }));
        }
      });

      await Promise.allSettled(promises);
    };

    loadImages();
  }, [imageKeys, enabled]);

  return {
    imageUrls,
    loadingStates,
    errors,
    isLoading: Object.values(loadingStates).some(Boolean),
  };
};

import { S3_THUMBNAIL } from "@/lib/s3";
import { useState } from "react";
import { toast } from "sonner";

interface UseDeleteImageProps {
  courseId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseDeleteImageReturn {
  deleteImage: (imageUrl: string) => Promise<boolean>;
  isDeleting: boolean;
  error: string | null;
}

/**
 * Extract the S3 key from a full image URL
 * @param imageUrl - Full URL like "https://endpoint/bucket/thumbnails/uuid.jpg"
 * @returns Key like "thumbnails/uuid.jpg" or null if extraction fails
 */
function extractThumbnailKey(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const pathname = url.pathname;

    // Remove leading slash and find thumbnails path
    const cleanPath = pathname.startsWith("/") ? pathname.slice(1) : pathname;

    // Look for thumbnails/ in the path
    const thumbnailsIndex = cleanPath.indexOf(`${S3_THUMBNAIL}/`);
    if (thumbnailsIndex === -1) {
      return null;
    }

    // Extract from thumbnails/ onwards
    return cleanPath.substring(thumbnailsIndex);
  } catch (error) {
    console.error("Error extracting thumbnail key:", error);
    return null;
  }
}

export function useDeleteImage({
  courseId: propsCourseId,
  onSuccess,
  onError,
}: UseDeleteImageProps = {}): UseDeleteImageReturn {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteImage = async (
    imageUrl: string,
    courseIdParam?: string
  ): Promise<boolean> => {
    const courseId = courseIdParam || propsCourseId;

    if (!imageUrl) {
      const errorMsg = "No image URL provided";
      setError(errorMsg);
      onError?.(errorMsg);
      return false;
    }

    if (!courseId) {
      const errorMsg = "Course ID is required for image deletion";
      setError(errorMsg);
      onError?.(errorMsg);
      return false;
    }

    try {
      setIsDeleting(true);
      setError(null);

      // Extract the S3 key from the URL
      const key = extractThumbnailKey(imageUrl);
      if (!key) {
        throw new Error("Invalid image URL - cannot extract key");
      }

      // Call our delete API
      const response = await fetch(
        `/api/upload/thumbnail?key=${encodeURIComponent(
          key
        )}&courseId=${encodeURIComponent(courseId)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to delete image");
      }

      toast.success("Image deleted successfully");
      onSuccess?.();
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Delete failed";
      setError(errorMsg);
      toast.error(errorMsg);
      onError?.(errorMsg);
      console.error("[IMAGE_DELETE_ERROR]", error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteImage,
    isDeleting,
    error,
  };
}

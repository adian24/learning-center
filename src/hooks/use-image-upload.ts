import { useState } from "react";
import { toast } from "sonner";

interface UseImageUploadProps {
  courseId?: string;
}

interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<string | null>;
  isUploading: boolean;
  error: string | null;
}

export function useImageUpload(
  props: UseImageUploadProps = {}
): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (
    file: File,
    courseIdParam?: string
  ): Promise<string | null> => {
    const courseId = courseIdParam || props.courseId;

    if (!courseId) {
      const errorMsg = "Course ID is required for image upload";
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    }

    // Validation
    if (!file.type.startsWith("image/")) {
      const errorMsg = "Please upload an image file";
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = "Image must be less than 5MB";
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    }

    try {
      setIsUploading(true);
      setError(null);

      // 1. Get presigned URL from our API
      const presignedResponse = await fetch("/api/upload/thumbnail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileType: file.type,
          courseId: courseId,
        }),
      });

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.text();
        throw new Error(errorData || "Failed to get upload URL");
      }

      const { presignedUrl, url } = await presignedResponse.json();

      // 2. Upload file directly to S3 using presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      toast.success("Image uploaded successfully");
      return url;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Upload failed";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("[IMAGE_UPLOAD_ERROR]", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
    error,
  };
}

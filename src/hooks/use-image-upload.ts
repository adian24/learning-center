import { useState } from "react";
import { toast } from "sonner";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (
    file: File,
    courseId?: string
  ): Promise<string | null> => {
    if (!file) return null;

    // Validate file type
    if (!file.type.includes("image")) {
      toast.error("Please upload an image file");
      return null;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return null;
    }

    setIsUploading(true);

    try {
      // Step 1: Get presigned URL
      const presignedResponse = await fetch("/api/upload/thumbnail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileType: file.type,
          courseId: courseId, // Optional - only for editing existing courses
        }),
      });

      if (!presignedResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { presignedUrl, url } = await presignedResponse.json();

      // Step 2: Upload to S3
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
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (
    imageUrl: string,
    courseId?: string
  ): Promise<boolean> => {
    try {
      // Extract key from URL
      const urlParts = imageUrl.split("/");
      const key = `thumbnails/${urlParts[urlParts.length - 1]}`;

      const deleteResponse = await fetch(
        `/api/upload/thumbnail?key=${encodeURIComponent(key)}${
          courseId ? `&courseId=${courseId}` : ""
        }`,
        {
          method: "DELETE",
        }
      );

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete image");
      }

      toast.success("Image deleted successfully");
      return true;
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete image");
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    isUploading,
  };
};

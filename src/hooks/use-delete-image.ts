"use client";

import { useState } from "react";
import { toast } from "sonner";

interface UseDeleteImageProps {
  onSuccess?: () => void;
}

export const useDeleteImage = ({ onSuccess }: UseDeleteImageProps = {}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteImage = async (imageUrl: string) => {
    if (!imageUrl) return;

    try {
      setIsDeleting(true);

      // Extract public ID from Cloudinary URL
      const urlParts = imageUrl.split("/");
      const publicIdWithExt = urlParts[urlParts.length - 1];
      const publicId = publicIdWithExt.split(".")[0];

      // Call delete API
      const response = await fetch(
        `/api/teacher/courses/upload?publicId=${publicId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Image deleted successfully");
        onSuccess?.();
        setIsDeleting(false);
      } else {
        toast.error("Failed to delete image");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Error deleting image");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteImage,
    isDeleting,
  };
};

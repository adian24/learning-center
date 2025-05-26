"use client";

import { useSecureImage } from "@/hooks/use-secure-media";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface SecureImageProps {
  imageKey: string | null | undefined;
  courseId?: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  sizes?: string;
  onLoad?: () => void;
  onError?: (error: string) => void;
}

export default function SecureImage({
  imageKey,
  courseId,
  alt,
  width,
  height,
  fill = false,
  className = "",
  priority = false,
  sizes,
  onLoad,
  onError,
}: SecureImageProps) {
  const [imageError, setImageError] = useState(false);

  const { imageUrl, isLoading, error } = useSecureImage(
    imageKey,
    courseId,
    !!imageKey
  );

  // Handle loading state
  if (isLoading && imageKey) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`}>
        {fill ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
          </div>
        ) : (
          <Skeleton
            className="w-full h-full"
            style={{ width: width || "100%", height: height || "200px" }}
          />
        )}
      </div>
    );
  }

  // Handle error state
  if (error || imageError || !imageUrl) {
    const errorMessage = error?.message || "Failed to load image";

    // Call onError callback if provided
    if (onError && error) {
      onError(errorMessage);
    }

    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${className}`}
      >
        <div className="text-center p-4">
          <ImageOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Image unavailable</p>
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
          )}
        </div>
      </div>
    );
  }

  // Render the actual image
  const imageProps = {
    src: imageUrl,
    alt,
    className: `transition-opacity duration-300 ${className}`,
    priority,
    sizes,
    onLoad: () => {
      setImageError(false);
      onLoad?.();
    },
    onError: () => {
      setImageError(true);
      onError?.("Image failed to load");
    },
  };

  if (fill) {
    return <Image {...imageProps} fill />;
  }

  return <Image {...imageProps} width={width || 400} height={height || 300} />;
}

// Specialized components for common use cases
export function CourseImageCard({
  imageKey,
  courseId,
  courseTitle,
  className = "aspect-video w-full",
}: {
  imageKey: string | null | undefined;
  courseId?: string;
  courseTitle: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <SecureImage
        imageKey={imageKey}
        courseId={courseId}
        alt={`${courseTitle} course thumbnail`}
        fill
        className="object-cover hover:scale-105 transition-transform duration-300"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}

export function AvatarImage({
  imageKey,
  userName,
  size = 40,
  className = "",
}: {
  imageKey: string | null | undefined;
  userName: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <SecureImage
        imageKey={imageKey}
        alt={`${userName}'s avatar`}
        fill
        className="object-cover"
        fallbackSrc="/placeholder-avatar.jpg"
      />
    </div>
  );
}

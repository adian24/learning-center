"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSecureImage } from "@/hooks/use-secure-media";
import { toast } from "sonner";
import { Upload, Trash2, Loader2, User, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileImageUploadProps {
  value?: string | null; // S3 key or null
  onChange: (key: string | null) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

export function ProfileImageUpload({
  value,
  onChange,
  disabled = false,
  className,
  size = "lg",
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get secure image URL for preview
  const { imageUrl: secureImageUrl, isLoading: isLoadingSecure } =
    useSecureImage(value, undefined, Boolean(value));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);

      // Create local preview immediately
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // 1. Get presigned URL from our new profile upload API
      const presignedResponse = await fetch("/api/upload/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileType: file.type,
        }),
      });

      if (!presignedResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { presignedUrl, key } = await presignedResponse.json();

      // 2. Upload to S3
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

      // 3. Update form with the S3 key
      onChange(key);

      // Clean up local preview since we'll use secure image
      URL.revokeObjectURL(localPreview);
      setPreviewUrl(null);

      toast.success("Profile image uploaded successfully");
    } catch (error) {
      console.error("Profile image upload error:", error);
      toast.error("Failed to upload profile image");

      // Clean up preview URL on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!value) return;

    try {
      // Delete from S3
      const deleteResponse = await fetch(
        `/api/upload/profile?key=${encodeURIComponent(value)}`,
        {
          method: "DELETE",
        }
      );

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete image");
      }

      onChange(null);
      toast.success("Profile image removed successfully");
    } catch (error) {
      console.error("Profile image delete error:", error);
      toast.error("Failed to remove profile image");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Determine what to show in avatar
  const showImage = previewUrl || secureImageUrl;
  const showLoading = isUploading || isLoadingSecure;

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      {/* Avatar Preview */}
      <div className="relative">
        <Avatar
          className={cn(
            sizeMap[size],
            "border-2 border-dashed border-muted-foreground"
          )}
        >
          <AvatarImage
            src={showImage || undefined}
            alt="Profile"
            className="object-cover"
          />
          <AvatarFallback>
            {showLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <User className="w-6 h-6" />
            )}
          </AvatarFallback>
        </Avatar>

        {/* Upload overlay button */}
        {!disabled && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="absolute -bottom-2 -right-2 rounded-full p-2 h-8 w-8"
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Camera className="w-3 h-3" />
            )}
          </Button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          disabled={disabled || isUploading}
          className="flex items-center gap-2"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {value ? "Change" : "Upload"}
        </Button>

        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveImage}
            disabled={disabled || isUploading}
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled}
      />

      {/* Upload instructions */}
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Upload a profile photo. JPG, PNG or WebP. Max 5MB.
      </p>
    </div>
  );
}

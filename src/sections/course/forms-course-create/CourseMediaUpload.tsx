"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { CourseFormValues } from "@/lib/validations/courses";
import { toast } from "sonner";
import SecureImage from "@/components/media/SecureImage";

interface CourseMediaUploadProps {
  form: UseFormReturn<CourseFormValues>;
  isSubmitting: boolean;
}

export const CourseMediaUpload = ({
  form,
  isSubmitting,
}: CourseMediaUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const imageKey = form.watch("imageUrl"); // This will be the S3 key

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

      // Create a local preview URL immediately for better UX
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);

      // 1. Get presigned URL (without courseId since we're creating a new course)
      const presignedResponse = await fetch("/api/upload/thumbnail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileType: file.type,
          // Don't pass courseId since we're creating a new course
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
      form.setValue("imageUrl", key);

      // Clean up the local preview URL since we now have the S3 key
      URL.revokeObjectURL(localPreviewUrl);
      setPreviewUrl(null);

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");

      // Clean up preview URL on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    // Clean up any preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    form.setValue("imageUrl", "");
  };

  const handleUploadClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
    fileInputRef.current?.click();
  };

  // Determine what to show:
  // 1. If uploading, show preview URL with loading state
  // 2. If we have an S3 key, show SecureImage
  // 3. Otherwise, show upload area
  const hasImage = imageKey || previewUrl;

  return (
    <FormField
      control={form.control}
      name="imageUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Course Thumbnail</FormLabel>
          <FormControl>
            <div className="space-y-4">
              {/* Hidden file input */}
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={isUploading || isSubmitting}
              />

              {/* Image preview or upload area */}
              {hasImage ? (
                <Card className="relative">
                  <CardContent className="p-4">
                    <div className="relative aspect-video w-full max-w-sm mx-auto">
                      {previewUrl ? (
                        // Show local preview while uploading
                        <div className="relative w-full h-full">
                          <img
                            src={previewUrl}
                            alt="Course thumbnail preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          {isUploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                              <div className="text-white text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                <p className="text-sm">Uploading...</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : imageKey ? (
                        // Show secure image for uploaded files
                        <SecureImage
                          imageKey={imageKey}
                          alt="Course thumbnail"
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      ) : null}

                      {/* Remove button */}
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                        disabled={isUploading || isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Replace button */}
                    <div className="mt-4 text-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleUploadClick}
                        disabled={isUploading || isSubmitting}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Replace Image
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* Upload area when no image */
                <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                  <CardContent className="p-8">
                    <div className="text-center space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900">
                          Upload Course Thumbnail
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          PNG, JPG, JPEG, or WEBP (max 5MB)
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleUploadClick}
                        disabled={isUploading || isSubmitting}
                        className="mt-4"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Choose Image
                          </>
                        )}
                      </Button>

                      {/* Drag and drop hint */}
                      <p className="text-xs text-gray-400">
                        or drag and drop an image here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

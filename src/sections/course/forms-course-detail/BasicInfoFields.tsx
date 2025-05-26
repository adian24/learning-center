"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { CourseFormValues } from "@/lib/validations/courses";
import { useState } from "react";
import { toast } from "sonner";
import { Course } from "@/lib/types";
import SecureImage from "@/components/media/SecureImage";

interface BasicInfoFieldsDetailProps {
  form: UseFormReturn<CourseFormValues>;
  isSubmitting: boolean;
  course: Course;
}

export const BasicInfoFieldsDetail = ({
  form,
  isSubmitting,
  course,
}: BasicInfoFieldsDetailProps) => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
      setIsUploadingImage(true);

      // 1. Get presigned URL
      const presignedResponse = await fetch("/api/upload/thumbnail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileType: file.type,
          courseId: course.id, // This will automatically update the course
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

      // 3. Update form with the new key
      form.setValue("imageUrl", key);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageDelete = async () => {
    try {
      const currentKey = form.getValues("imageUrl");
      if (!currentKey) return;

      // Delete from S3 and update course
      const deleteResponse = await fetch(
        `/api/upload/thumbnail?key=${encodeURIComponent(currentKey)}&courseId=${
          course.id
        }`,
        {
          method: "DELETE",
        }
      );

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete image");
      }

      form.setValue("imageUrl", "");
      toast.success("Image removed successfully");
    } catch (error) {
      console.error("Image delete error:", error);
      toast.error("Failed to remove image");
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Image Upload */}
      <FormField
        control={form.control}
        name="imageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Course Thumbnail</FormLabel>
            <FormControl>
              <div className="space-y-4">
                {field.value ? (
                  <div className="relative">
                    <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border">
                      <SecureImage
                        imageKey={field.value}
                        courseId={course.id}
                        alt="Course thumbnail"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleImageDelete}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer"
                        >
                          <Button
                            type="button"
                            variant="outline"
                            disabled={isUploadingImage || isSubmitting}
                            asChild
                          >
                            <span>
                              {isUploadingImage ? (
                                "Uploading..."
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload Image
                                </>
                              )}
                            </span>
                          </Button>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(file);
                              }
                            }}
                            disabled={isUploadingImage || isSubmitting}
                          />
                        </label>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </FormControl>
            <FormDescription>
              Upload a thumbnail image for your course. Recommended size: 16:9
              aspect ratio.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Course Title */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Course Title</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="e.g. Complete Web Development Course"
                disabled={isSubmitting}
              />
            </FormControl>
            <FormDescription>
              Make it clear and descriptive. This will be the main title
              students see.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Course Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Course Description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Describe what students will learn in this course..."
                rows={5}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormDescription>
              Provide a detailed description of what students will learn and
              achieve.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

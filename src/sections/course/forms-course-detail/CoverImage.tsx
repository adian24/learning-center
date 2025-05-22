import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useDeleteImage } from "@/hooks/use-delete-image";
import { CourseFormValues } from "@/lib/validations/courses";
import { ImagePlus, Loader2, RotateCw } from "lucide-react";
import Image from "next/image";
import React from "react";
import { UseFormReturn } from "react-hook-form";

interface CoverImageProps {
  form: UseFormReturn<CourseFormValues>;
  isSubmitting: boolean;
  isUploading: boolean;
  onImageUpload: (file: File) => Promise<void>;
  courseId?: string;
}

const CoverImage = ({
  form,
  isSubmitting,
  onImageUpload,
  isUploading,
  courseId,
}: CoverImageProps) => {
  const { deleteImage, isDeleting } = useDeleteImage({
    courseId,
    onSuccess: () => form.setValue("imageUrl", ""),
  });
  return (
    <div className="flex flex-col items-center justify-center rounded-lg">
      {form.getValues("imageUrl") ? (
        <div className="w-full aspect-video rounded-lg">
          <div className="flex justify-between items-center">
            <FormLabel>Cover Image</FormLabel>
            <Button
              variant="link"
              size="sm"
              onClick={() => deleteImage(form.getValues("imageUrl"))}
              disabled={isDeleting || isSubmitting}
              className="hover:text-blue-300 text-blue-600 text-xs"
            >
              {isDeleting && <Loader2 className="animate-spin" />}
              <RotateCw /> Ubah Cover Image
            </Button>
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-b-lg">
            <div className="absolute inset-0 bg-gray-950/5" />
            <Image
              src={form.getValues("imageUrl")}
              alt="Course thumbnail"
              className="object-cover transition-transform duration-300 hover:scale-105"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </div>
        </div>
      ) : (
        <>
          <ImagePlus className="h-12 w-12 text-gray-400" />
          <p className="text-sm text-gray-500 text-center">
            Drag and drop gambar Anda di sini, atau klik untuk memilih
          </p>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            disabled={isUploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                await onImageUpload(file);
              }
            }}
          />
          <Button
            variant="outline"
            disabled={isUploading}
            onClick={() => {
              document.getElementById("image-upload")?.click();
            }}
          >
            {isUploading && <Loader2 className="animate-spin" />}
            {isUploading ? "Mengupload..." : "Pilih Gambar"}
          </Button>
        </>
      )}
    </div>
  );
};

export default CoverImage;

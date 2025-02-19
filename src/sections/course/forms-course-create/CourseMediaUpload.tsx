import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { CourseFormValues } from "@/lib/validations/courses";
import { useDeleteImage } from "@/hooks/use-delete-image";
import Image from "next/image";

interface CourseMediaUploadProps {
  form: UseFormReturn<CourseFormValues>;
  isSubmitting: boolean;
  isUploading: boolean;
  onImageUpload: (file: File) => Promise<void>;
}

export const CourseMediaUpload = ({
  form,
  isSubmitting,
  isUploading,
  onImageUpload,
}: CourseMediaUploadProps) => {
  const { deleteImage, isDeleting } = useDeleteImage({
    onSuccess: () => form.setValue("imageUrl", ""),
  });

  return (
    <div className="group relative rounded-lg border-2 border-dashed border-gray-200 bg-white transition-all hover:border-gray-300">
      {form.getValues("imageUrl") ? (
        <div className="space-y-4 p-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-50">
            <div className="absolute inset-0 z-10 bg-gray-950 opacity-0 transition-opacity group-hover:opacity-10" />
            <Image
              src={form.getValues("imageUrl")}
              alt="Course thumbnail"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </div>

          <div className="flex justify-center">
            <Button
              variant="link"
              size="sm"
              onClick={() => deleteImage(form.getValues("imageUrl"))}
              disabled={isDeleting || isSubmitting}
              className="hover:text-red-300 text-red-600"
            >
              {isDeleting && <Loader2 className="animate-spin" />}
              Hapus dan Ubah
            </Button>
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

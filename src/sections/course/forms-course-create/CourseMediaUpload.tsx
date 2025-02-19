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
    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 space-y-4">
      {form.getValues("imageUrl") ? (
        <div className="w-full aspect-video rounded-lg">
          <Image
            src={form.getValues("imageUrl")}
            alt="Course thumbnail"
            className="object-cover"
          />
          <div className="mt-4 flex justify-center">
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

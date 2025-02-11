import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { CourseFormValues } from "@/lib/validations/courses";
import { useImageUpload } from "@/hooks/use-image-upload";
import CoverImage from "./CoverImage";

interface BasicInfoFieldsProps {
  form: UseFormReturn<CourseFormValues>;
  isSubmitting: boolean;
}

export const BasicInfoFieldsDetail = ({
  form,
  isSubmitting,
}: BasicInfoFieldsProps) => {
  const { uploadImage, isUploading } = useImageUpload();

  const handleImageUpload = async (file: File) => {
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      form.setValue("imageUrl", imageUrl);
    }
  };

  return (
    <div className="space-y-6">
      <CoverImage
        form={form}
        isUploading={isUploading}
        isSubmitting={isSubmitting}
        onImageUpload={handleImageUpload}
      />
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Judul Course</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="e.g. Web Development Fundamentals"
                disabled={isSubmitting}
              />
            </FormControl>
            <FormDescription>
              Buat judul yang menarik dan deskriptif
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Deskripsi</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Jelaskan apa yang akan dipelajari dalam course ini..."
                rows={5}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

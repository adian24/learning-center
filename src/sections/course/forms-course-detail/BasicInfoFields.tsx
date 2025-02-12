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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCreateChapterStore } from "@/store/use-store-create-chapter";
import { Course } from "@/lib/types";
import { ChapterList } from "@/sections/course/chapter/ChapterList";

interface BasicInfoFieldsProps {
  form: UseFormReturn<CourseFormValues>;
  isSubmitting: boolean;
  course: Course | undefined;
}

export const BasicInfoFieldsDetail = ({
  form,
  isSubmitting,
  course
}: BasicInfoFieldsProps) => {
  const { uploadImage, isUploading } = useImageUpload();
  const onOpenCreateDialog = useCreateChapterStore((state) => state.onOpen);

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

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Chapters ({course?.chapters.length})</h3>
          <Button
            variant="ghost"
            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
            onClick={() => {
              onOpenCreateDialog({
                courseId: course?.id || "",
                courseTitle: course?.title || "",
              });
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Chapter
          </Button>
        </div>
        <ChapterList courseId={course?.id ?? ""} />
      </div>
    </div>
  );
};

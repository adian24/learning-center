"use client";

import React from "react";

import { useParams, useRouter } from "next/navigation";
import Layout from "@/layout";

// rhf
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// hooks
import { useCourseQuery } from "@/hooks/use-course-query";
import { useUpdateCourse } from "@/hooks/use-update-course";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useCategories } from "@/hooks/use-categories";

// store
import { useDeleteCourseStore } from "@/store/use-delete-course-store";

// import
import { CourseForm } from "@/sections/course/forms-course-create/CourseForm";
import { CourseMediaUpload } from "@/sections/course/forms-course-create/CourseMediaUpload";

// validation/schema
import { courseFormSchema, CourseFormValues } from "@/lib/validations/courses";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CourseDetail = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const { data: course, isLoading: isLoadingCourse } = useCourseQuery(courseId);
  const { mutate: updateCourse, isPending: isUpdating } =
    useUpdateCourse(courseId);
  const { uploadImage, isUploading } = useImageUpload();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const onOpenDeleteDialog = useDeleteCourseStore((state) => state.onOpen);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: course?.title || "",
      description: course?.description || "",
      imageUrl: course?.imageUrl || "",
      price: course?.price || 0,
      //   categoryId: course?.categoryId || "",
      level: course?.level || "BEGINNER",
    },
  });

  // Update form values when course data is loaded
  React.useEffect(() => {
    if (course) {
      form.reset({
        title: course.title,
        description: course.description || "",
        imageUrl: course.imageUrl || "",
        price: course.price || 0,
        // categoryId: course.categoryId || "",
        level: course.level,
      });
    }
  }, [course, form]);

  const handleImageUpload = async (file: File) => {
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      form.setValue("imageUrl", imageUrl);
    }
  };

  async function onSubmit(data: CourseFormValues) {
    updateCourse(data);
  }

  if (isLoadingCourse) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Edit Course</h1>
          </div>
          <Button
            variant="destructive"
            onClick={() =>
              onOpenDeleteDialog({ id: courseId, title: course?.title || "" })
            }
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Course
          </Button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent>
              <CourseForm
                form={form}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
                categories={categories}
                origin="update"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Media</CardTitle>
              <CardDescription>
                Ubah gambar thumbnail untuk course Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CourseMediaUpload
                form={form}
                isUploading={isUploading}
                isSubmitting={isSubmitting}
                onImageUpload={handleImageUpload}
              />
              {form.formState.errors.imageUrl && (
                <p className="text-sm text-red-500 mt-2">
                  {form.formState.errors.imageUrl.message}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetail;

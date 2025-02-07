"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Layout from "@/layout";
import { courseFormSchema, CourseFormValues } from "@/lib/validations/courses";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useCategories } from "@/hooks/use-categories";
import { CourseMediaUpload } from "@/sections/course/forms-course-create/CourseMediaUpload";
import { CourseForm } from "@/sections/course/forms-course-create/CourseForm";

const CreateCourse = () => {
  const router = useRouter();
  const { uploadImage, isUploading } = useImageUpload();
  const { data: categories, isLoading } = useCategories();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      price: 0,
      categoryId: "",
      level: "BEGINNER",
    },
  });

  const handleImageUpload = async (file: File) => {
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      form.setValue("imageUrl", imageUrl);
    }
  };

  async function onSubmit(data: CourseFormValues) {
    try {
      setIsSubmitting(true);

      const response = await fetch("/api/teacher/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Course berhasil dibuat!");
        router.push("/teacher/courses");
        router.refresh();
        setIsSubmitting(true);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat membuat course");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold">Buat Course Baru</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>
                Masukkan informasi dasar course Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CourseForm
                form={form}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
                categories={categories}
                origin="create"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Media</CardTitle>
              <CardDescription>
                Upload gambar thumbnail untuk course Anda
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

export default CreateCourse;

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
import { CourseFormValues } from "@/lib/validations/courses";
import { ArrowLeft, Loader2, Gift, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useCategories } from "@/hooks/use-categories";
import { CourseMediaUpload } from "@/sections/course/forms-course-create/CourseMediaUpload";
import { useMutation } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const createCourse = async (data: CourseFormValues) => {
  const response = await fetch("/api/teacher/courses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create course");
  }

  return response.json();
};

const CreateCourse = () => {
  const router = useRouter();
  const { uploadImage, isUploading } = useImageUpload();
  const { data: categories } = useCategories();

  const form = useForm<CourseFormValues>({
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      price: 0,
      categoryId: "",
      level: "BEGINNER",
      isPublished: false,
    },
  });

  // Watch the price field for the interaction
  const watchedPrice = form.watch("price");
  const isFree = !watchedPrice || watchedPrice == 0;

  const handleImageUpload = async (file: File) => {
    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      form.setValue("imageUrl", imageUrl);
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      toast.success("Course successfully created!");
      router.push("/teacher/courses");
      router.refresh();
    },
    onError: () => {
      toast.error("An error occurred while creating the course");
    },
  });

  const onSubmit = (data: CourseFormValues) => {
    mutate(data);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-12 gap-6"
          >
            {/* Main Content - Left Column */}
            <div className="col-span-8">
              <Card>
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                  <CardDescription>
                    Masukkan informasi dasar untuk course Anda
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CourseMediaUpload
                    form={form}
                    isUploading={isUploading}
                    isSubmitting={isPending}
                    onImageUpload={handleImageUpload}
                  />
                  {form.formState.errors.imageUrl && (
                    <p className="text-sm text-red-500 mt-2">
                      {form.formState.errors.imageUrl.message}
                    </p>
                  )}

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
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Buatlah judul yang menarik dan deskriptif
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
                            placeholder="Jelaskan apa yang akan dipelajari Student dalam Course ini..."
                            rows={5}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Right Column */}
            <div className="col-span-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Settings</CardTitle>
                  <CardDescription>
                    Konfigurasikan detail dan harga course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BEGINNER">Beginner</SelectItem>
                            <SelectItem value="INTERMEDIATE">
                              Intermediate
                            </SelectItem>
                            <SelectItem value="ADVANCED">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategori</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga (IDR)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="e.g. 100.000"
                            disabled={isPending}
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          />
                        </FormControl>

                        {/* Beautiful Free Course Info with Animation */}
                        <div className="relative overflow-hidden">
                          <div
                            className={`transition-all duration-500 ease-in-out transform ${
                              isFree
                                ? "opacity-100 translate-y-0 max-h-20"
                                : "opacity-0 -translate-y-2 max-h-0"
                            }`}
                          >
                            <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Gift className="h-4 w-4 text-emerald-600" />
                                  <Sparkles className="h-3 w-3 text-emerald-500 animate-pulse" />
                                </div>
                                <span className="text-sm font-semibold text-emerald-700">
                                  GRATIS
                                </span>
                              </div>
                              <p className="text-xs text-emerald-600 mt-1">
                                Course ini akan tersedia gratis untuk semua
                                students
                              </p>
                            </div>
                          </div>
                        </div>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Course...
                      </>
                    ) : (
                      "Create Course"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default CreateCourse;

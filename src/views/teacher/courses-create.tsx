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
import { CourseFormValues, courseFormSchema } from "@/lib/validations/courses";
import { ArrowLeft, Loader2, Gift, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const { data: categories } = useCategories();

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    mode: "onChange", // Enable real-time validation
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

  // Get form errors
  const errors = form.formState.errors;
  const hasErrors = Object.keys(errors).length > 0;

  const { mutate, isPending } = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      toast.success("Course successfully created!");
      router.push("/teacher/courses");
      router.refresh();
    },
    onError: (error: any) => {
      console.error("Course creation error:", error);
      toast.error("An error occurred while creating the course");
    },
  });

  const onSubmit = (data: CourseFormValues) => {
    // Additional validation check
    if (!data.imageUrl || data.imageUrl.trim() === "") {
      form.setError("imageUrl", {
        type: "required",
        message: "Please upload a course thumbnail",
      });
      toast.error("Please upload a course thumbnail");
      return;
    }

    // Validate required fields
    if (!data.title.trim()) {
      form.setError("title", {
        type: "required",
        message: "Course title is required",
      });
      return;
    }

    if (!data.description.trim()) {
      form.setError("description", {
        type: "required",
        message: "Course description is required",
      });
      return;
    }

    if (!data.categoryId) {
      form.setError("categoryId", {
        type: "required",
        message: "Please select a category",
      });
      return;
    }

    console.log("Submitting course data:", data);
    mutate(data);
  };

  const onInvalid = (errors: any) => {
    console.log("Form validation errors:", errors);
    toast.error("Please fix the form errors before submitting");
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
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
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
                  {/* Course Media Upload */}
                  <CourseMediaUpload form={form} isSubmitting={isPending} />

                  {/* Course Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul Course *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Web Development Fundamentals"
                            disabled={isPending}
                            className={
                              errors.title
                                ? "border-red-500 focus:border-red-500"
                                : ""
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Buatlah judul yang menarik dan deskriptif (minimal 3
                          karakter)
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
                        <FormLabel>Deskripsi *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Jelaskan apa yang akan dipelajari Student dalam Course ini..."
                            rows={5}
                            disabled={isPending}
                            className={
                              errors.description
                                ? "border-red-500 focus:border-red-500"
                                : ""
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Jelaskan secara detail apa yang akan dipelajari
                          (minimal 10 karakter)
                        </FormDescription>
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
                  {/* Course Level */}
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
                            <SelectTrigger
                              className={
                                errors.level
                                  ? "border-red-500 focus:border-red-500"
                                  : ""
                              }
                            >
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

                  {/* Course Category */}
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategori *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isPending}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={
                                errors.categoryId
                                  ? "border-red-500 focus:border-red-500"
                                  : ""
                              }
                            >
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

                  {/* Course Price */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga (IDR)</FormLabel>
                        <FormControl>
                          <Input
                            value={
                              field.value
                                ? field.value
                                    .toString()
                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                                : ""
                            }
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(
                                /\./g,
                                ""
                              );
                              const numericValue = parseInt(rawValue) || 0;
                              field.onChange(numericValue);
                            }}
                            placeholder="e.g. 100.000"
                            disabled={isPending}
                            inputMode="numeric"
                            className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                              errors.price
                                ? "border-red-500 focus:border-red-500"
                                : ""
                            }`}
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
                                  GRATIS!
                                </span>
                              </div>
                              <p className="text-xs text-emerald-600 mt-1">
                                Course harga Rp 0 akan gratis untuk semua
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

              {/* Submit Button Card */}
              <Card>
                <CardContent className="pt-6">
                  {/* Show validation errors summary */}
                  {hasErrors && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">
                            Please fix the following errors:
                          </p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {errors.imageUrl && (
                              <li>Upload a course thumbnail</li>
                            )}
                            {errors.title && <li>{errors.title.message}</li>}
                            {errors.description && (
                              <li>{errors.description.message}</li>
                            )}
                            {errors.categoryId && (
                              <li>{errors.categoryId.message}</li>
                            )}
                            {errors.price && <li>{errors.price.message}</li>}
                            {errors.level && <li>{errors.level.message}</li>}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

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

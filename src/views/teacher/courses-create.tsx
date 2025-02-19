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
import { ArrowLeft, Loader2 } from "lucide-react";
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
    // resolver: zodResolver(courseFormSchema),
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
      // console.error(error);
    },
  });

  const onSubmit = (data: CourseFormValues) => {
    console.log("CEK SUBMUT : ", data);
    mutate(data);
  };

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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
                <CardDescription>
                  Masukkan informasi dasar course Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CardContent>
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
                </CardContent>
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
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
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
                              <SelectValue placeholder="Pilih level" />
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
                              <SelectValue placeholder="Pilih kategori" />
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
                </div>

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
                          placeholder="e.g. 49.99"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="mt-5 w-full text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Membuat Course...
                    </>
                  ) : (
                    "Buat Coursex"
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </Layout>
  );
};

export default CreateCourse;

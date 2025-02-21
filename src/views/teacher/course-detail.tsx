"use client";

import React from "react";

import { useParams } from "next/navigation";
import Layout from "@/layout";

// rhf
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// hooks
import { useCourseQuery } from "@/hooks/use-course-query";
import { useUpdateCourse } from "@/hooks/use-update-course";

// import
import { Eye, HandCoins, LibraryBig, Loader2, Rocket } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BasicInfoFieldsDetail } from "@/sections/course/forms-course-detail/BasicInfoFields";
import DetailInfoHeader from "@/sections/course/forms-course-detail/DetailInfoHeader";
import DetailInfoFoms from "@/sections/course/forms-course-detail/DetailInfoFoms";

// validation/schema
import { courseFormSchema, CourseFormValues } from "@/lib/validations/courses";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useCategories } from "@/hooks/use-categories";

const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId as string;

  const { data: course, isLoading: isLoadingCourse } = useCourseQuery(courseId);
  const { mutate: updateCourse, isPending: isUpdating } =
    useUpdateCourse(courseId);
  const { data: categories } = useCategories();

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
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

  // Update form values when course data is loaded
  React.useEffect(() => {
    if (course) {
      console.log("Course data:", course);
      form.reset({
        title: course.title || "",
        description: course.description || "",
        imageUrl: course.imageUrl || "",
        price: course.price || 0,
        categoryId: course.categoryId || "", // Ensure fallback to empty string
        level: course.level || "BEGINNER", // Fallback to default level
        isPublished: course.isPublished || false,
      });
    }
  }, [course, form.reset]);

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
      <Form {...form}>
        <form id="detailCourseForm" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <DetailInfoHeader course={course} isUpdating={isUpdating} />

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      Course Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BasicInfoFieldsDetail
                      form={form}
                      isSubmitting={isUpdating}
                      course={course}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-slate-800">
                  <CardHeader>
                    <div className="flex flex-row justify-between">
                      <div>
                        <CardTitle className="text-xl text-white">
                          Preview Course
                        </CardTitle>
                        <CardDescription className="text-white">
                          Lihat bagaimana Student meninjau Course Anda
                        </CardDescription>
                      </div>
                      <Button variant="outline" type="button">
                        Pratinjau
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex flex-row justify-between">
                      <CardTitle className="text-xl">Course Level</CardTitle>
                      <Rocket />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pilih Level</FormLabel>
                          <Select
                            {...field}
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isUpdating}
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex flex-row justify-between">
                      <CardTitle className="text-xl">Course Kategori</CardTitle>
                      <LibraryBig />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pilih Kategori</FormLabel>
                          <Select
                            {...field}
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isUpdating}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex flex-row justify-between">
                      <CardTitle className="text-xl">Harga Course</CardTitle>
                      <HandCoins />
                    </div>
                  </CardHeader>
                  <CardContent>
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
                              disabled={isUpdating}
                              value={field.value}
                              // startContent="Rp"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex flex-row justify-between">
                      <CardTitle className="text-xl">
                        Publikasi Course
                      </CardTitle>
                      <Eye />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="isPublished"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Publikasi</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </Layout>
  );
};

export default CourseDetail;

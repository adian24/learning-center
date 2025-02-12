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

// import

// validation/schema
import { courseFormSchema, CourseFormValues } from "@/lib/validations/courses";
import { HandCoins, LibraryBig, Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DetailInfoHeader from "@/sections/course/forms-course-detail/DetailInfoHeader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BasicInfoFieldsDetail } from "@/sections/course/forms-course-detail/BasicInfoFields";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import DetailInfoFoms from "@/sections/course/forms-course-detail/DetailInfoFoms";

const CourseDetail = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const { data: course, isLoading: isLoadingCourse } = useCourseQuery(courseId);
  const { mutate: updateCourse, isPending: isUpdating } =
    useUpdateCourse(courseId);
  const { uploadImage, isUploading } = useImageUpload();

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
      <Form {...form}>
        <form
          id="detailCourseForm"
          onSubmit={form.handleSubmit(onSubmit)}
        // className="space-y-6"
        >
          <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <DetailInfoHeader course={course} />

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
                      isSubmitting={isSubmitting}
                      course={course}
                    />
                  </CardContent>
                </Card>
              </div>

              <DetailInfoFoms form={form} isSubmitting={isSubmitting} />
            </div>
          </div>
        </form>
      </Form>
    </Layout>
  );
};

export default CourseDetail;

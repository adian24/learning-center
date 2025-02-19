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
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { BasicInfoFieldsDetail } from "@/sections/course/forms-course-detail/BasicInfoFields";
import DetailInfoHeader from "@/sections/course/forms-course-detail/DetailInfoHeader";
import DetailInfoFoms from "@/sections/course/forms-course-detail/DetailInfoFoms";

// validation/schema
import { courseFormSchema, CourseFormValues } from "@/lib/validations/courses";

const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId as string;

  const { data: course, isLoading: isLoadingCourse } = useCourseQuery(courseId);
  const { mutate: updateCourse, isPending: isUpdating } =
    useUpdateCourse(courseId);

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
      form.reset({
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl,
        price: course.price,
        categoryId: course.categoryId,
        level: course.level,
        isPublished: course.isPublished,
      });
    }
  }, [course, form]);

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

              <DetailInfoFoms form={form} isSubmitting={isUpdating} />
            </div>
          </div>
        </form>
      </Form>
    </Layout>
  );
};

export default CourseDetail;

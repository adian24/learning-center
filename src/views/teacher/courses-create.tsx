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
import { useTranslations } from "next-intl";

const CreateCourse = () => {
  const t = useTranslations("teacher_form_course");
  const tCommon = useTranslations("common");

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

  const createCourse = async (data: CourseFormValues) => {
    const response = await fetch("/api/teacher/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(t("toast_create_failed"));
    }

    return response.json();
  };

  const { mutate, isPending } = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      toast.success(t("toast_success"));
      router.push("/teacher/courses");
      router.refresh();
    },
    onError: (error: any) => {
      console.error("Course creation error:", error);
      toast.error(t("toast_error"));
    },
  });

  const onSubmit = (data: CourseFormValues) => {
    // Additional validation check
    if (!data.imageUrl || data.imageUrl.trim() === "") {
      form.setError("imageUrl", {
        type: "required",
        message: t("error_image_required"),
      });
      toast.error(t("error_image_required"));
      return;
    }

    // Validate required fields
    if (!data.title.trim()) {
      form.setError("title", {
        type: "required",
        message: t("error_title_required"),
      });
      return;
    }

    if (!data.description.trim()) {
      form.setError("description", {
        type: "required",
        message: t("error_description_required"),
      });
      return;
    }

    if (!data.categoryId) {
      form.setError("categoryId", {
        type: "required",
        message: t("error_category_required"),
      });
      return;
    }

    console.log("Submitting course data:", data);
    mutate(data);
  };

  const onInvalid = (errors: any) => {
    console.log("Form validation errors:", errors);
    toast.error(t("alert_fix_errors"));
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
            {t("back")}
          </Button>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
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
                  <CardTitle>{t("section_info_title")}</CardTitle>
                  <CardDescription>{t("section_info_desc")}</CardDescription>
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
                        <FormLabel>{t("field_title")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("field_title_placeholder")}
                            disabled={isPending}
                            className={
                              errors.title
                                ? "border-red-500 focus:border-red-500"
                                : ""
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          {t("field_title_description")}
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
                        <FormLabel>{t("field_description")}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={t("field_description_placeholder")}
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
                          {t("field_description_description")}
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
                  <CardTitle>{t("section_settings_title")}</CardTitle>
                  <CardDescription>
                    {t("section_settings_desc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Course Level */}
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("field_level")}</FormLabel>
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
                              <SelectValue
                                placeholder={t("field_level_placeholder")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BEGINNER">
                              {tCommon("level_beginner")}
                            </SelectItem>
                            <SelectItem value="INTERMEDIATE">
                              {tCommon("level_intermediate")}
                            </SelectItem>
                            <SelectItem value="ADVANCED">
                              {tCommon("level_advanced")}
                            </SelectItem>
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
                        <FormLabel>{t("field_category")}</FormLabel>
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
                              <SelectValue
                                placeholder={t("field_category_placeholder")}
                              />
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
                        <FormLabel>{t("field_price")}</FormLabel>
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
                            placeholder={t("field_price_placeholder")}
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
                                  {t("field_free_label")}
                                </span>
                              </div>
                              <p className="text-xs text-emerald-600 mt-1">
                                {t("field_free_description")}
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
                          <p className="font-medium">{t("alert_fix_errors")}</p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            {errors.imageUrl && (
                              <li>{t("error_image_required")}</li>
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
                        {t("button_creating")}
                      </>
                    ) : (
                      t("button_submit")
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

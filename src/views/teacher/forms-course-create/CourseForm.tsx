"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { CourseFormValues } from "@/lib/validations/courses";
import { UseFormReturn } from "react-hook-form";
import { BasicInfoFields } from "./BasicInfoFields";

interface CourseFormProps {
  form: UseFormReturn<CourseFormValues>;
  onSubmit: (data: CourseFormValues) => Promise<void>;
  isSubmitting: boolean;
  categories?: Array<{ id: string; name: string }>;
}

export const CourseForm = ({
  form,
  onSubmit,
  isSubmitting,
  categories,
}: CourseFormProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInfoFields
          form={form}
          isSubmitting={isSubmitting}
          categories={categories}
        />
        <Button
          type="submit"
          className="w-full text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Membuat Course...
            </>
          ) : (
            "Buat Course"
          )}
        </Button>
      </form>
    </Form>
  );
};

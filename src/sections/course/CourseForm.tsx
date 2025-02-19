"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { CourseFormValues } from "@/lib/validations/courses";
import { UseFormReturn } from "react-hook-form";
import { BasicInfoFieldsCreate } from "./forms-course-create/BasicInfoFields";

interface CourseFormCreateProps {
  form: UseFormReturn<CourseFormValues>;
  onSubmit: (data: CourseFormValues) => void;
  isSubmitting: boolean;
  categories?: Array<{ id: string; name: string }>;
}

export const CourseFormCreate = ({
  form,
  onSubmit,
  isSubmitting,
  categories,
}: CourseFormCreateProps) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BasicInfoFieldsCreate
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
            "Buat Coursex"
          )}
        </Button>
      </form>
    </Form>
  );
};

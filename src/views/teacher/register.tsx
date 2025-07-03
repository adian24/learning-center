"use client";

import Layout from "@/layout";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTeacherRegistrationStore } from "@/store/use-teacher-registration-store";
import TeacherRegistrationStepper from "@/sections/teacher/register/TeacherRegistrationStepper";

// Updated form schemas to include profileUrl
const step1Schema = z.object({
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  expertise: z
    .array(z.string())
    .min(1, "Select at least one area of expertise"),
  profileUrl: z.string().nullable().optional(),
});

type Step1FormValues = z.infer<typeof step1Schema>;

export default function TeacherRegistration() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    teacherData,
    selectedCompany,
    isSubmitting,
    teacherProfileId,
    setTeacherData,
    setIsSubmitting,
    resetStore,
    nextStep,
  } = useTeacherRegistrationStore();

  // Final submission mutation
  const finalSubmitMutation = useMutation({
    mutationFn: async () => {
      if (!teacherProfileId) {
        // Scenario 2: Create profile at step 3
        const response = await fetch("/api/teacher", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...teacherData,
            ...(selectedCompany && { companyId: selectedCompany.id }),
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || "Failed to create teacher profile");
        }

        return response.json();
      } else {
        // Update with company if selected
        const updateData: any = {};

        if (selectedCompany) {
          updateData.companyId = selectedCompany.id;
        }

        // Include profileUrl if it was updated
        if (teacherData.profileUrl !== undefined) {
          updateData.profileUrl = teacherData.profileUrl;
        }

        const response = await fetch(`/api/teacher/${teacherProfileId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || "Failed to update teacher profile");
        }

        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["user-role"] });
      toast.success("Registration completed successfully!");
      resetStore();
      router.push("/teacher/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Registration failed");
    },
  });

  // Handle step 1 submission
  const onStep1Submit = (values: Step1FormValues) => {
    setTeacherData(values);
    nextStep();
  };

  // Handle final submission
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await finalSubmitMutation.mutateAsync();
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-8">
        <TeacherRegistrationStepper
          onStep1Submit={onStep1Submit}
          onFinalSubmit={handleFinalSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </Layout>
  );
}

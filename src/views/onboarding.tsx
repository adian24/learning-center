"use client";

import { RoleSelection } from "@/components/onboarding/role-selection";
import TeacherRegistrationStepper from "@/sections/teacher/register/TeacherRegistrationStepper";
import { useUserRole } from "@/hooks/use-user-role";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import { useTeacherRegistrationStore } from "@/store/use-teacher-registration-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const Onboarding = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { role } = useUserRole();

  // Get step from URL, default to 'role-selection'
  const currentStep = searchParams.get("step") || "role-selection";

  const {
    selectedRole,
    setRole,
    resetStore: resetOnboardingStore,
  } = useOnboardingStore();

  const {
    teacherData,
    selectedCompany,
    isSubmitting,
    setTeacherData,
    setIsSubmitting,
    resetStore: resetTeacherStore,
  } = useTeacherRegistrationStore();

  // Create student profile mutation
  const createStudentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Gagal membuat profil siswa");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["user-role"] });
      toast.success("Selamat datang! Profil siswa Anda telah dibuat.");
      // Redirect first, then reset store to avoid UI flickering
      router.push("/dashboard");
      // Reset store after a small delay to ensure navigation starts
      setTimeout(() => {
        resetTeacherStore();
      }, 100);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal membuat profil siswa");
    },
  });

  // Create teacher profile mutation
  const createTeacherMutation = useMutation({
    mutationFn: async () => {
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
        throw new Error(errorData || "Gagal membuat profil pengajar");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["user-role"] });
      toast.success("Selamat datang! Profil pengajar Anda telah dibuat.");
      // Redirect first, then reset store to avoid UI flickering
      router.push("/teacher/dashboard");
      // Reset store after a small delay to ensure navigation starts
      setTimeout(() => {
        resetTeacherStore();
      }, 100);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal membuat profil pengajar");
    },
  });

  const handleRoleSelect = async (selectedRole: "STUDENT" | "TEACHER") => {
    setRole(selectedRole);

    if (selectedRole === "STUDENT") {
      setIsSubmitting(true);
      try {
        await createStudentMutation.mutateAsync();
      } catch (error) {
        console.error("Error pembuatan profil siswa:", error);
      } finally {
        setIsSubmitting(false);
      }
    } else if (selectedRole === "TEACHER") {
      // Navigate to teacher registration
      router.push("/onboarding?step=teacher-profile");
    }
  };

  const handleStep1Submit = (values: any) => {
    setTeacherData(values);
    // Move to next step after saving data
    const { nextStep } = useTeacherRegistrationStore.getState();
    nextStep();
  };

  const handleTeacherFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createTeacherMutation.mutateAsync();
    } catch (error) {
      console.error("Error pembuatan profil pengajar:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToRoleSelection = () => {
    resetOnboardingStore();
    resetTeacherStore();
    router.push("/onboarding?step=role-selection");
  };

  // Show loading if session is loading
  if (!session) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Role Selection Step */}
      {currentStep === "role-selection" && (
        <div className="container max-w-4xl mx-auto px-4">
          <RoleSelection 
            onRoleSelect={handleRoleSelect} 
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Teacher Onboarding Steps */}
      {currentStep === "teacher-profile" && (
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <TeacherRegistrationStepper
            onStep1Submit={handleStep1Submit}
            onFinalSubmit={handleTeacherFinalSubmit}
            onBackToRoleSelection={handleBackToRoleSelection}
            isSubmitting={isSubmitting}
          />
        </div>
      )}
    </div>
  );
};

export default Onboarding;

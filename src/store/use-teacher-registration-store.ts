import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface TeacherFormData {
  bio: string;
  expertise: string[];
}

export interface SelectedCompany {
  id: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  location?: string | null;
  website?: string | null;
  industry?: string | null;
  isVerified: boolean;
}

interface TeacherRegistrationState {
  // Current step (1, 2, or 3)
  currentStep: number;

  // Form data
  teacherData: TeacherFormData;
  selectedCompany: SelectedCompany | null;

  // Loading states
  isCreatingProfile: boolean;
  isUpdatingProfile: boolean;
  isSubmitting: boolean;

  // Teacher profile ID (for updates)
  teacherProfileId: string | null;

  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  setTeacherData: (data: TeacherFormData) => void;
  setSelectedCompany: (company: SelectedCompany | null) => void;

  setIsCreatingProfile: (loading: boolean) => void;
  setIsUpdatingProfile: (loading: boolean) => void;
  setIsSubmitting: (loading: boolean) => void;

  setTeacherProfileId: (id: string | null) => void;

  // Reset store
  resetStore: () => void;
}

const initialState = {
  currentStep: 1,
  teacherData: {
    bio: "",
    expertise: [],
  },
  selectedCompany: null,
  isCreatingProfile: false,
  isUpdatingProfile: false,
  isSubmitting: false,
  teacherProfileId: null,
};

export const useTeacherRegistrationStore = create<TeacherRegistrationState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCurrentStep: (step: number) => {
        if (step >= 1 && step <= 3) {
          set({ currentStep: step });
        }
      },

      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < 3) {
          set({ currentStep: currentStep + 1 });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },

      setTeacherData: (data: TeacherFormData) => {
        set({ teacherData: data });
      },

      setSelectedCompany: (company: SelectedCompany | null) => {
        set({ selectedCompany: company });
      },

      setIsCreatingProfile: (loading: boolean) => {
        set({ isCreatingProfile: loading });
      },

      setIsUpdatingProfile: (loading: boolean) => {
        set({ isUpdatingProfile: loading });
      },

      setIsSubmitting: (loading: boolean) => {
        set({ isSubmitting: loading });
      },

      setTeacherProfileId: (id: string | null) => {
        set({ teacherProfileId: id });
      },

      resetStore: () => {
        set(initialState);
      },
    }),
    {
      name: "teacher-registration-store",
    }
  )
);

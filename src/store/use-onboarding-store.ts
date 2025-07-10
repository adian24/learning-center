import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Company {
  id: string;
  name: string;
  logo?: string;
}

export interface TeacherData {
  bio: string;
  expertise: string[];
  profileUrl?: string | null;
}

export interface OnboardingState {
  currentStep: number;
  selectedRole: "STUDENT" | "TEACHER" | null;
  teacherData: TeacherData;
  selectedCompany: Company | null;
  isSubmitting: boolean;
  
  // Actions
  setRole: (role: "STUDENT" | "TEACHER") => void;
  setTeacherData: (data: Partial<TeacherData>) => void;
  setSelectedCompany: (company: Company | null) => void;
  nextStep: () => void;
  prevStep: () => void;
  setCurrentStep: (step: number) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  resetStore: () => void;
}

const initialState = {
  currentStep: 1,
  selectedRole: null,
  teacherData: {
    bio: "",
    expertise: [],
    profileUrl: null,
  },
  selectedCompany: null,
  isSubmitting: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setRole: (role) => {
        set({ selectedRole: role });
        // If student, skip to final step
        if (role === "STUDENT") {
          set({ currentStep: 3 });
        } else {
          set({ currentStep: 2 });
        }
      },
      
      setTeacherData: (data) => {
        set((state) => ({
          teacherData: { ...state.teacherData, ...data },
        }));
      },
      
      setSelectedCompany: (company) => {
        set({ selectedCompany: company });
      },
      
      nextStep: () => {
        set((state) => ({ currentStep: state.currentStep + 1 }));
      },
      
      prevStep: () => {
        set((state) => ({ currentStep: Math.max(1, state.currentStep - 1) }));
      },
      
      setCurrentStep: (step) => {
        set({ currentStep: step });
      },
      
      setIsSubmitting: (isSubmitting) => {
        set({ isSubmitting });
      },
      
      resetStore: () => {
        set(initialState);
      },
    }),
    {
      name: "onboarding-storage",
      partialize: (state) => ({
        currentStep: state.currentStep,
        selectedRole: state.selectedRole,
        teacherData: state.teacherData,
        selectedCompany: state.selectedCompany,
      }),
    }
  )
);
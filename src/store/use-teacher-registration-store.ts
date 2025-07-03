import { create } from "zustand";

export interface TeacherData {
  bio: string;
  expertise: string[];
  profileUrl?: string | null;
}

interface Company {
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
  // Current state
  currentStep: number;
  teacherData: TeacherData;
  selectedCompany: Company | null;
  isSubmitting: boolean;
  teacherProfileId: string | null;

  // Actions
  nextStep: () => void;
  prevStep: () => void;
  setCurrentStep: (step: number) => void;
  setTeacherData: (data: TeacherData) => void;
  updateTeacherData: (data: Partial<TeacherData>) => void;
  setSelectedCompany: (company: Company | null) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setTeacherProfileId: (id: string | null) => void;
  resetStore: () => void;
}

const initialState = {
  currentStep: 1,
  teacherData: {
    bio: "",
    expertise: [],
    profileUrl: null,
  },
  selectedCompany: null,
  isSubmitting: false,
  teacherProfileId: null,
};

export const useTeacherRegistrationStore = create<TeacherRegistrationState>(
  (set, get) => ({
    ...initialState,

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

    setCurrentStep: (step: number) => {
      if (step >= 1 && step <= 3) {
        set({ currentStep: step });
      }
    },

    setTeacherData: (data: TeacherData) => {
      set({ teacherData: data });
    },

    updateTeacherData: (data: Partial<TeacherData>) => {
      set((state) => ({
        teacherData: { ...state.teacherData, ...data },
      }));
    },

    setSelectedCompany: (company: Company | null) => {
      set({ selectedCompany: company });
    },

    setIsSubmitting: (isSubmitting: boolean) => {
      set({ isSubmitting });
    },

    setTeacherProfileId: (id: string | null) => {
      set({ teacherProfileId: id });
    },

    resetStore: () => {
      set(initialState);
    },
  })
);

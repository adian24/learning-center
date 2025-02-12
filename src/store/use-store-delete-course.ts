import { create } from "zustand";

interface DeleteCourse {
  id: string;
  title: string;
}

interface DeleteCourseStore {
  // State
  isOpen: boolean;
  courseToDelete: DeleteCourse | null;
  isDeleting: boolean;

  // Actions
  onOpen: (course: DeleteCourse) => void;
  onClose: () => void;
  setIsDeleting: (isDeleting: boolean) => void;
  reset: () => void;
}

export const useDeleteCourseStore = create<DeleteCourseStore>((set) => ({
  // Initial state
  isOpen: false,
  courseToDelete: null,
  isDeleting: false,

  // Actions
  onOpen: (course) => set({ isOpen: true, courseToDelete: course }),
  onClose: () => set({ isOpen: false }),
  setIsDeleting: (isDeleting) => set({ isDeleting }),
  reset: () => set({ isOpen: false, courseToDelete: null, isDeleting: false }),
}));

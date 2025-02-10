import { create } from "zustand";

interface CreateChapter {
  courseId: string | number;
  courseTitle: string;
}

interface CreateChapterStore {
  // State
  isOpen: boolean;
  chapterToCreate: CreateChapter | null;
  isCreating: boolean;

  // Actions
  onOpen: (course: CreateChapter) => void;
  onClose: () => void;
  setIsCreating: (isCreating: boolean) => void;
  reset: () => void;
}

export const useCreateChapterStore = create<CreateChapterStore>((set) => ({
  // Initial state
  isOpen: false,
  chapterToCreate: null,
  isCreating: false,

  // Actions
  onOpen: (course) => set({ isOpen: true, chapterToCreate: course }),
  onClose: () => set({ isOpen: false }),
  setIsCreating: (isCreating) => set({ isCreating }),
  reset: () => set({ isOpen: false, chapterToCreate: null, isCreating: false }),
}));

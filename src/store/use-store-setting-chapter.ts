import { create } from "zustand";

interface SettingChapter {
  courseId: string | number;
  chapterId: string;
}

interface SettingChapterStore {
  // State
  isOpen: boolean;
  isUpdating: boolean;
  chapterToUpdate: SettingChapter | null;

  // Actions
  onOpen: (chapter: SettingChapter) => void;
  onClose: () => void;
  setIsUpdating: (isUpdating: boolean) => void;
  reset: () => void;
}

export const useSettingChapterStore = create<SettingChapterStore>((set) => ({
  // Initial state
  isOpen: false,
  isUpdating: false,
  chapterToUpdate: null,

  // Actions
  onOpen: (chapter) => set({ isOpen: true, chapterToUpdate: chapter }),
  onClose: () => set({ isOpen: false }),
  setIsUpdating: (isUpdating) => set({ isUpdating }),
  reset: () => set({ isOpen: false, chapterToUpdate: null, isUpdating: false }),
}));

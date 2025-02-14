import { Chapter } from "@/lib/types";
import { create } from "zustand";

interface EditChapterStore {
  isOpen: boolean;
  isEditing: boolean;
  chapterToEdit: Chapter | null;
  onOpen: (chapter: Chapter) => void;
  onClose: () => void;
  setIsEditing: (isEditing: boolean) => void;
  reset: () => void;
}

export const useEditChapterStore = create<EditChapterStore>((set) => ({
  isOpen: false,
  isEditing: false,
  chapterToEdit: null,
  onOpen: (chapter) => set({ isOpen: true, chapterToEdit: chapter }),
  onClose: () => set({ isOpen: false }),
  setIsEditing: (isEditing) => set({ isEditing }),
  reset: () => set({ isOpen: false, isEditing: false, chapterToEdit: null }),
}));
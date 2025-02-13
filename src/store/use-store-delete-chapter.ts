import { Chapter } from "@/lib/types";
import { create } from "zustand";

interface DeleteChapterStore {
  isOpen: boolean;
  isDeleting: boolean;
  chapterToDelete: Chapter | null;
  onOpen: (chapter: Chapter) => void;
  onClose: () => void;
  setIsDeleting: (isDeleting: boolean) => void;
  reset: () => void;
}

export const useDeleteChapterStore = create<DeleteChapterStore>((set) => ({
  isOpen: false,
  isDeleting: false,
  chapterToDelete: null,
  onOpen: (chapter) => set({ isOpen: true, chapterToDelete: chapter }),
  onClose: () => set({ isOpen: false }),
  setIsDeleting: (isDeleting) => set({ isDeleting }),
  reset: () => set({ isOpen: false, isDeleting: false, chapterToDelete: null }),
}));
import { create } from "zustand";
import { ChapterWithProgress } from "../lib/types/chapter";

interface DeleteVideoStore {
  isOpen: boolean;
  isDeleting: boolean;
  videoToDelete: ChapterWithProgress | undefined;
  onOpen: (chapter: ChapterWithProgress | undefined) => void;
  onClose: () => void;
  setIsDeleting: (isDeleting: boolean) => void;
  reset: () => void;
}

export const useDeleteVideoStore = create<DeleteVideoStore>((set) => ({
  isOpen: false,
  isDeleting: false,
  videoToDelete: undefined,
  onOpen: (chapter) => set({ isOpen: true, videoToDelete: chapter }),
  onClose: () => set({ isOpen: false }),
  setIsDeleting: (isDeleting) => set({ isDeleting }),
  reset: () =>
    set({ isOpen: false, isDeleting: false, videoToDelete: undefined }),
}));

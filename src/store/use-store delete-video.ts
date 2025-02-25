import { Chapter } from "@/lib/types";
import { create } from "zustand";

interface DeleteVideoStore {
  isOpen: boolean;
  isDeleting: boolean;
  videoToDelete: Chapter | null | undefined;
  onOpen: (chapter: Chapter | undefined) => void;
  onClose: () => void;
  setIsDeleting: (isDeleting: boolean) => void;
  reset: () => void;
}

export const useDeleteVideoStore = create<DeleteVideoStore>((set) => ({
  isOpen: false,
  isDeleting: false,
  videoToDelete: null,
  onOpen: (chapter) => set({ isOpen: true, videoToDelete: chapter }),
  onClose: () => set({ isOpen: false }),
  setIsDeleting: (isDeleting) => set({ isDeleting }),
  reset: () => set({ isOpen: false, isDeleting: false, videoToDelete: null }),
}));

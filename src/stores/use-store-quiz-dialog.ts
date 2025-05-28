import { create } from "zustand";

interface QuizDialogState {
  // Create Quiz Dialog
  isCreateOpen: boolean;
  openCreateDialog: () => void;
  closeCreateDialog: () => void;

  // Edit Quiz Dialog
  isEditOpen: boolean;
  editingQuizId: string | null;
  openEditDialog: (quizId: string) => void;
  closeEditDialog: () => void;

  // Delete Quiz Dialog
  isDeleteOpen: boolean;
  deletingQuizId: string | null;
  openDeleteDialog: (quizId: string) => void;
  closeDeleteDialog: () => void;

  // Reset all states
  resetAllDialogs: () => void;
}

export const useQuizDialogStore = create<QuizDialogState>((set) => ({
  // Create Quiz Dialog
  isCreateOpen: false,
  openCreateDialog: () => set({ isCreateOpen: true }),
  closeCreateDialog: () => set({ isCreateOpen: false }),

  // Edit Quiz Dialog
  isEditOpen: false,
  editingQuizId: null,
  openEditDialog: (quizId: string) =>
    set({ isEditOpen: true, editingQuizId: quizId }),
  closeEditDialog: () => set({ isEditOpen: false, editingQuizId: null }),

  // Delete Quiz Dialog
  isDeleteOpen: false,
  deletingQuizId: null,
  openDeleteDialog: (quizId: string) =>
    set({ isDeleteOpen: true, deletingQuizId: quizId }),
  closeDeleteDialog: () => set({ isDeleteOpen: false, deletingQuizId: null }),

  // Reset all states
  resetAllDialogs: () =>
    set({
      isCreateOpen: false,
      isEditOpen: false,
      isDeleteOpen: false,
      editingQuizId: null,
      deletingQuizId: null,
    }),
}));

import { create } from "zustand";

interface ResourcesState {
  chapterId: string | null;

  isCreateOpen: boolean;
  openCreateDialog: (chapterId: string) => void;
  closeCreateDialog: () => void;

  isEditOpen: boolean;
  editingResourceId: string | null;
  openEditDialog: (resourceId: string) => void;
  closeEditDialog: () => void;

  isDeleteOpen: boolean;
  deletingResourceId: string | null;
  openDeleteDialog: (resourceId: string) => void;
  closeDeleteDialog: () => void;

  resetAllDialogs: () => void;
}

export const useResourcesStore = create<ResourcesState>((set) => ({
  chapterId: null,
  isCreateOpen: false,
  openCreateDialog: (chapterId: string) =>
    set({ isCreateOpen: true, chapterId }),
  closeCreateDialog: () => set({ isCreateOpen: false, chapterId: null }),

  isEditOpen: false,
  editingResourceId: null,
  openEditDialog: (resourceId: string) =>
    set({ isEditOpen: true, editingResourceId: resourceId }),
  closeEditDialog: () => set({ isEditOpen: false, editingResourceId: null }),

  isDeleteOpen: false,
  deletingResourceId: null,
  openDeleteDialog: (resourceId: string) =>
    set({ isDeleteOpen: true, deletingResourceId: resourceId }),
  closeDeleteDialog: () =>
    set({ isDeleteOpen: false, deletingResourceId: null }),

  resetAllDialogs: () =>
    set({
      isCreateOpen: false,
      isEditOpen: false,
      editingResourceId: null,
      isDeleteOpen: false,
      deletingResourceId: null,
    }),
}));

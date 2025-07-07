import { create } from 'zustand';

interface ReviewDialogState {
  // Dialog state
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view';
  
  // Course and review data
  courseId: string | null;
  reviewId: string | null;
  
  // Form data
  rating: number;
  comment: string;
  
  // Loading states
  isSubmitting: boolean;
  
  // Actions
  openCreateDialog: (courseId: string) => void;
  openEditDialog: (courseId: string, reviewId: string, rating: number, comment: string) => void;
  openViewDialog: (courseId: string, reviewId: string) => void;
  closeDialog: () => void;
  
  // Form actions
  setRating: (rating: number) => void;
  setComment: (comment: string) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  
  // Reset form
  resetForm: () => void;
}

export const useReviewDialogStore = create<ReviewDialogState>((set) => ({
  // Initial state
  isOpen: false,
  mode: 'create',
  courseId: null,
  reviewId: null,
  rating: 5,
  comment: '',
  isSubmitting: false,
  
  // Dialog actions
  openCreateDialog: (courseId: string) => set({
    isOpen: true,
    mode: 'create',
    courseId,
    reviewId: null,
    rating: 5,
    comment: '',
    isSubmitting: false,
  }),
  
  openEditDialog: (courseId: string, reviewId: string, rating: number, comment: string) => set({
    isOpen: true,
    mode: 'edit',
    courseId,
    reviewId,
    rating,
    comment: comment || '',
    isSubmitting: false,
  }),
  
  openViewDialog: (courseId: string, reviewId: string) => set({
    isOpen: true,
    mode: 'view',
    courseId,
    reviewId,
    isSubmitting: false,
  }),
  
  closeDialog: () => set({
    isOpen: false,
    mode: 'create',
    courseId: null,
    reviewId: null,
    rating: 5,
    comment: '',
    isSubmitting: false,
  }),
  
  // Form actions
  setRating: (rating: number) => set({ rating }),
  setComment: (comment: string) => set({ comment }),
  setSubmitting: (isSubmitting: boolean) => set({ isSubmitting }),
  
  // Reset form
  resetForm: () => set({
    rating: 5,
    comment: '',
    isSubmitting: false,
  }),
}));
// Main types index file - export all types from here
export * from "./quiz";
export * from "./course";
export * from "./chapter";
export * from "./user";
export * from "./resource";

// Common utility types
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Common form types
export interface FormState {
  isSubmitting: boolean;
  isValid: boolean;
  errors: Record<string, string>;
}

// Media types
export interface MediaFile {
  id: string;
  url: string;
  key: string;
  type: "image" | "video" | "document";
  size: number;
  name: string;
  uploadedAt: string;
}

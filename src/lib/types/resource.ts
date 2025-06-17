// Resource types based on Prisma schema

export interface Resource {
  id: string;
  title: string;
  content: string;
  summary?: string | null;
  readTime?: number | null;
  isPublished: boolean;
  chapterId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceWithChapter extends Resource {
  chapter: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
    };
  };
}

// Form types for creating/updating resources
export interface CreateResourceRequest {
  title: string;
  content: string;
  summary?: string;
  readTime?: number;
  isPublished?: boolean;
  chapterId: string;
}

export interface UpdateResourceRequest {
  title?: string;
  content?: string;
  summary?: string;
  readTime?: number;
  isPublished?: boolean;
}

// API response types
export interface ResourcesResponse {
  resources: ResourceWithChapter[];
  meta: {
    currentPage: number;
    totalPages: number;
    perPage: number;
    total: number;
  };
}

// Query parameters for resources
export interface ResourceFilters {
  chapterId?: string;
  page?: number;
  perPage?: number;
}

// Resource status for display
export type ResourceStatus = 'draft' | 'published';

export interface ResourceSummary {
  id: string;
  title: string;
  status: ResourceStatus;
  readTime?: number;
  chapterTitle: string;
  courseTitle: string;
  createdAt: string;
  updatedAt: string;
}
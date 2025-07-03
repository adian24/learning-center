// Job types based on Prisma schema
export interface Job {
  id: string;
  title: string;
  location: string;
  description: string;
  level: JobLevel;
  salary: number;
  category: string;
  companyId: string;
  isActive: boolean;
  requirements?: string | null;
  benefits?: string | null;
  employmentType?: string | null;
  experienceLevel?: string | null;
  createdAt: string;
  updatedAt: string;
}

export enum JobLevel {
  PEMULA = "PEMULA",
  MENENGAH = "MENENGAH",
  LANJUT = "LANJUT"
}

// Job filtering interface
export interface JobFilters {
  level?: string;
  category?: string;
  location?: string;
  isActive?: boolean;
  search?: string;
}

// Form types
export interface CreateJobRequest {
  title: string;
  location: string;
  description: string;
  level: JobLevel;
  salary: number;
  category: string;
  companyId: string;
  requirements?: string;
  benefits?: string;
  employmentType?: string;
  experienceLevel?: string;
}

export interface UpdateJobRequest {
  title?: string;
  location?: string;
  description?: string;
  level?: JobLevel;
  salary?: number;
  category?: string;
  isActive?: boolean;
  requirements?: string;
  benefits?: string;
  employmentType?: string;
  experienceLevel?: string;
}
import { Company } from "./company";

// Job level enum matching Prisma schema
export type JobLevel = "PEMULA" | "MENENGAH" | "LANJUT";

// Base Job interface
export interface Job {
  id: string;
  title: string;
  location: string;
  description: string;
  level: JobLevel;
  price: number;
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

// Job with company information
export interface JobWithCompany extends Job {
  company: Company;
}

// Company with jobs
export interface CompanyWithJobs extends Company {
  jobs: Job[];
}

// Form types for creating/updating jobs
export interface CreateJobRequest {
  title: string;
  location: string;
  description: string;
  level: JobLevel;
  price: number;
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
  price?: number;
  category?: string;
  requirements?: string;
  benefits?: string;
  employmentType?: string;
  experienceLevel?: string;
  isActive?: boolean;
}

// API response types
export interface JobsResponse {
  jobs: JobWithCompany[];
  meta: {
    currentPage: number;
    totalPages: number;
    perPage: number;
    total: number;
  };
}

// Query parameters for jobs
export interface JobFilters {
  companyId?: string;
  level?: JobLevel;
  category?: string;
  location?: string;
  isActive?: boolean;
  page?: number;
  perPage?: number;
  search?: string;
}

// Job summary for display in lists
export interface JobSummary {
  id: string;
  title: string;
  location: string;
  level: JobLevel;
  price: number;
  category: string;
  companyName: string;
  companyLogoUrl?: string;
  isActive: boolean;
  createdAt: string;
}

// Constants for job levels with display names
export const JOB_LEVELS: Record<JobLevel, string> = {
  PEMULA: "Pemula",
  MENENGAH: "Menengah",
  LANJUT: "Lanjut",
};

// Common job categories (you can customize these)
export const JOB_CATEGORIES = [
  "Teknologi & Pemrograman",
  "Bisnis & Manajemen",
  "Sertifikasi Profesional",
  "Desain & Kreatif",
  "Marketing & Sales",
  "Data & Analytics",
  "Keuangan & Akuntansi",
  "Sumber Daya Manusia",
  "Operasional",
  "Lainnya",
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number];

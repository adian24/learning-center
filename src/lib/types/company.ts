import { TeacherProfile } from "./user";
import { Job } from "./job";

// Company types based on Prisma schema
export interface Company {
  id: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  location?: string | null;
  website?: string | null;
  industry?: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyWithTeachers extends Company {
  teachers: TeacherProfile[];
}

export interface CompanyWithJobs extends Company {
  jobs: Job[];
}

export interface CompanyWithTeachersAndJobs extends Company {
  teachers: TeacherProfile[];
  jobs: Job[];
}

export interface TeacherProfileWithCompany {
  id: string;
  bio?: string | null;
  expertise: string[];
  profileUrl?: string | null;
  companyId?: string | null;
  company?: Company | null;
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

// Form types
export interface CreateCompanyRequest {
  name: string;
  description?: string;
  logoUrl?: string;
  location?: string;
  website?: string;
  industry?: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  description?: string;
  logoUrl?: string;
  location?: string;
  website?: string;
  industry?: string;
  isVerified?: boolean;
}

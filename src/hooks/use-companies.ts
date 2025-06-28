import { useQuery } from "@tanstack/react-query";

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
  _count?: {
    teachers: number;
  };
}

interface CompaniesResponse {
  companies: Company[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function fetchCompanies(
  page: number = 1,
  limit: number = 50
): Promise<CompaniesResponse> {
  const response = await fetch(`/api/companies?page=${page}&limit=${limit}`);

  if (!response.ok) {
    throw new Error("Failed to fetch companies");
  }

  return response.json();
}

export function useCompanies(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ["companies", page, limit],
    queryFn: () => fetchCompanies(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for getting presigned URL for company logo
export async function getCompanyLogoPresignedUrl(
  logoKey: string
): Promise<string | null> {
  try {
    const response = await fetch("/api/secure/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key: logoKey }),
    });

    if (response.ok) {
      const { url } = await response.json();
      return url;
    }
  } catch (error) {
    console.error("Failed to get presigned URL:", error);
  }
  return null;
}

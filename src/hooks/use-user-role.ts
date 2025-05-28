import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface UserRoleResponse {
  role: "TEACHER" | "STUDENT" | null;
  profile: any;
}

async function getUserRole(): Promise<UserRoleResponse> {
  const response = await fetch("/api/me");

  if (!response.ok) {
    throw new Error("Failed to fetch user role");
  }

  return response.json();
}

export function useUserRole() {
  const { data: session, status } = useSession();

  const query = useQuery({
    queryKey: ["user-role"],
    queryFn: getUserRole,
    enabled: status === "authenticated" && !!session?.user,
    staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes
    retry: 2,
  });

  return {
    ...query,
    role: query.data?.role || null,
    profile: query.data?.profile || null,
    isTeacher: query.data?.role === "TEACHER",
    isStudent: query.data?.role === "STUDENT",
    isLoading: status === "loading" || query.isLoading,
  };
}

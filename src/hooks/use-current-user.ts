import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  teacherProfile: { id: string } | null;
  studentProfile: { id: string } | null;
}

export const useCurrentUser = () => {
  return useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch("/api/me");
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      return response.json();
    },
  });
};

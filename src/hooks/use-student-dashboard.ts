// hooks/use-student-dashboard.ts
import { useQuery } from "@tanstack/react-query";

// Types
type ProfileData = {
  name: string;
  email: string;
  image: string | null;
  currentXP: number;
  maxXP: number;
};

type ProgressStats = {
  inProgress: number;
  completed: number;
  totalPoints: number;
};

type CourseWithProgress = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  teacher: string;
  category: string | null;
  chaptersCount: number;
  completedChapters: number;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
};

type Achievement = {
  id: string;
  title: string;
  xp: number;
};

// Fetch functions
const fetchProfile = async (): Promise<ProfileData> => {
  const response = await fetch("/api/student/dashboard/profile");

  if (!response.ok) {
    throw new Error("Failed to fetch profile data");
  }

  return response.json();
};

const fetchProgress = async (): Promise<ProgressStats> => {
  const response = await fetch("/api/student/dashboard/progress");

  if (!response.ok) {
    throw new Error("Failed to fetch progress stats");
  }

  return response.json();
};

const fetchCourses = async (): Promise<CourseWithProgress[]> => {
  const response = await fetch("/api/student/dashboard/courses");

  if (!response.ok) {
    throw new Error("Failed to fetch courses");
  }

  return response.json();
};

const fetchAchievements = async (): Promise<Achievement[]> => {
  const response = await fetch("/api/student/dashboard/achievements");

  if (!response.ok) {
    throw new Error("Failed to fetch achievements");
  }

  return response.json();
};

// Hooks
export const useStudentProfile = () => {
  return useQuery({
    queryKey: ["studentProfile"],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useStudentProgress = () => {
  return useQuery({
    queryKey: ["studentProgress"],
    queryFn: fetchProgress,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStudentCourses = () => {
  return useQuery({
    queryKey: ["studentCourses"],
    queryFn: fetchCourses,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStudentAchievements = () => {
  return useQuery({
    queryKey: ["studentAchievements"],
    queryFn: fetchAchievements,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

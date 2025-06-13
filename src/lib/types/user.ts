// User and profile related types
export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  emailVerified?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  user: User;
  bio?: string;
  expertise: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserWithProfiles extends User {
  studentProfile?: StudentProfile;
  teacherProfile?: TeacherProfile;
}

// Auth related types
export interface AuthUser {
  user: User;
  userProfile: UserWithProfiles;
  isLoading: boolean;
  isAuthenticated: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  session: any;
}

// app/(dashboard)/(routes)/dashboard/page.tsx
"use client";

import { Card } from "@/components/ui/card";
import Layout from "@/layout";
import AchievementCard from "@/sections/dashboard/AchievementCard";
import CourseCard from "@/sections/dashboard/CourseCard";
import ProfileHeader from "@/sections/dashboard/ProfileHeader";
import ProgressCard from "@/sections/dashboard/ProgressCard";
import { Clock, CheckCircle, Star } from "lucide-react";
import { format } from "date-fns";
import {
  useStudentProfile,
  useStudentProgress,
  useStudentCourses,
  useStudentAchievements,
} from "@/hooks/use-student-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { data: profile } = useStudentProfile();
  const { data: progress, isLoading: progressLoading } = useStudentProgress();
  const { data: courses, isLoading: coursesLoading } = useStudentCourses();
  const { data: achievements, isLoading: achievementsLoading } =
    useStudentAchievements();

  // Format date for the welcome message
  const today = new Date();
  const formattedDate = format(today, "MMM d, yyyy");

  return (
    <Layout>
      {/* Top Navigation */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-16">
            <h1 className="text-lg font-bold sm:text-xl md:text-2xl">
              Selamat datang {profile?.name || ""}!
            </h1>
            <p className="text-muted-foreground text-xs sm:text-base">
              Lihat kemajuan pembelajaran Anda untuk hari ini {formattedDate}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Section */}
          <ProfileHeader
            currentXp={profile?.currentXP || 0}
            maxXp={profile?.maxXP || 0}
          />

          {/* Achievement Cards */}
          <div className="space-y-2">
            {achievementsLoading ? (
              // Loading skeletons
              Array(2)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-lg p-4">
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                ))
            ) : achievements && achievements.length > 0 ? (
              achievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  title={achievement.title}
                  xp={achievement.xp}
                />
              ))
            ) : (
              <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
                No achievements unlocked yet. Start learning to earn XP!
              </div>
            )}
          </div>

          {/* Progress Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ProgressCard
              title="In Progress"
              count={progress?.inProgress || 0}
              icon={Clock}
              isLoading={progressLoading}
            />
            <ProgressCard
              title="Completed"
              count={progress?.completed || 0}
              icon={CheckCircle}
              isLoading={progressLoading}
            />
            <ProgressCard
              title="Points"
              count={`${progress?.totalPoints || 0} XP`}
              icon={Star}
              isLoading={progressLoading}
            />
          </div>

          {/* Courses Section */}
          <h2 className="text-xl font-semibold mt-8">My Courses</h2>
          {coursesLoading ? (
            // Loading skeleton for courses
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-32 w-full" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-2 w-full mt-3" />
                    </div>
                  </Card>
                ))}
            </div>
          ) : courses && courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  imageUrl={course.imageUrl}
                  category={course.category}
                  progress={course.progress}
                  chaptersCount={course.chaptersCount}
                  completedChapters={course.completedChapters}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-gray-400">No courses found</p>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

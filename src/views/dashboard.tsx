"use client";

import { Card } from "@/components/ui/card";
import Layout from "@/layout";
import AchievementCard from "@/sections/dashboard/AchievementCard";
import ProfileHeader from "@/sections/dashboard/ProfileHeader";
import ProgressCard from "@/sections/dashboard/ProgressCard";
import { Clock, CheckCircle, Star } from "lucide-react";
import { useSession } from "next-auth/react";

const Dashboard = () => {
  const { data: session } = useSession();

  const achievements = [
    { id: "1", title: "Dapatkan 10 XP dari menonton 1 Chapter", xp: 10 },
    { id: "2", title: "Dapatkan 50 XP dari mengerjakan Quiz", xp: 50 },
  ];

  const stats = {
    inProgress: 0,
    completed: 0,
    totalPoints: 0,
  };

  return (
    <Layout>
      {/* Top Navigation */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-16">
            <h1 className="text-lg font-bold sm:text-xl md:text-2xl">
              Selamat datang {session?.user?.name}!
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Lihat kemajuan pembelajaran Anda untuk hari ini{" "}
              {new Date(Date.now()).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl  px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Section */}
          <ProfileHeader currentXp={0} maxXp={80} />

          {/* Achievement Cards */}
          <div className="space-y-2">
            {achievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                title={achievement.title}
                xp={achievement.xp}
              />
            ))}
          </div>

          {/* Progress Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ProgressCard
              title="In Progress"
              count={stats.inProgress}
              icon={Clock}
            />
            <ProgressCard
              title="Completed"
              count={stats.completed}
              icon={CheckCircle}
            />
            <ProgressCard
              title="Points"
              count={`${stats.totalPoints} XP`}
              icon={Star}
            />
          </div>

          {/* No Courses Message */}
          <Card className="p-8 text-center">
            <p className="text-gray-400">No courses found</p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

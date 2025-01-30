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
      <div className="flex flex-col mb-6 md:gap-1">
        <h1 className="text-lg font-semibold sm:text-xl md:text-2xl sm:font-bold">
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
      <div className="bg-secondary border rounded-lg overflow-hidden">
        <div className="p-4 md:p-6">
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
      </div>
    </Layout>
  );
};

export default Dashboard;

"use client";

import React from "react";
import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useSession } from "next-auth/react";

interface ProfileHeaderProps {
  currentXp: number;
  maxXp: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ currentXp, maxXp }) => {
  const { data: session } = useSession();

  const [progress, setProgress] = React.useState<number>(
    (currentXp / maxXp) * 100
  );

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(currentXp), 500);
    return () => clearTimeout(timer);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 3);
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex items-center space-x-4">
        {session?.user?.image ? (
          <div className="flex items-center h-16 sm:h-24 lg:h-28 w-16 sm:w-24 lg:w-28 aspect-square">
            <Avatar className="h-20 w-20 rounded-full">
              <AvatarImage
                src={session?.user?.image ?? undefined}
                alt={session?.user?.name ?? undefined}
              />
              <AvatarFallback>
                {getInitials(session?.user?.name as string)}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <Image
            height={300}
            width={300}
            src={`https://ui-avatars.com/api/?name=${session?.user?.name}&background=random`}
            alt="logo"
            className="h-10 sm:h-24 lg:h-28 w-10 sm:w-24 lg:w-28 rounded-full"
          />
        )}
        <div className="flex flex-col gap-4 w-full pr-6">
          <h1 className="font-bold sm:text-xl lg:text-3xl">
            {session?.user?.name}
          </h1>
          <div className="flex justify-between mt-1">
            <span className="text-sm text-gray-400">{currentXp} XP</span>
            <span className="text-sm text-gray-400">{maxXp} XP</span>
          </div>
          <Progress value={progress} className="h-2 bg-zinc-200" />
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;

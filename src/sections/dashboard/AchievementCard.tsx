import { ChevronRight } from "lucide-react";

interface AchievementCardProps {
  title: string;
  xp: number;
}

const AchievementCard = ({ title, xp }: AchievementCardProps) => {
  return (
    <div className="flex items-center justify-between bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition-colors">
      <span>{title}</span>
      <div className="flex items-center space-x-2">
        <span className="font-medium">{xp} XP</span>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
};

export default AchievementCard;

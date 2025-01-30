import { ChevronRight } from "lucide-react";

interface AchievementCardProps {
  title: string;
  xp: number;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ title, xp }) => (
  <div className="flex items-center justify-between p-3 bg-gray-400 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors">
    <span className="text-gray-900">{title}</span>
    <div className="flex items-center space-x-2">
      <span className="text-gray-900">{xp} XP</span>
      <ChevronRight className="w-5 h-5 text-gray-900" />
    </div>
  </div>
);

export default AchievementCard;

import { Card } from "@/components/ui/card";

// Types and Interfaces
interface ProgressCardProps {
  title: string;
  count: number | string;
  icon: React.ElementType;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  count,
  icon: Icon,
}) => {
  return (
    <Card className="p-4 flex items-center space-x-3">
      <Icon className="w-6 h-6 text-gray-500" />
      <div>
        <h3 className="text-gray-500 font-medium">{title}</h3>
        <p className="text-gray-500 text-sm">{count} Courses</p>
      </div>
    </Card>
  );
};

export default ProgressCard;

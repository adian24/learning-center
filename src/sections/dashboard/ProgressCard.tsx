import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ProgressCardProps {
  title: string;
  count: number | string;
  icon: LucideIcon;
  isLoading?: boolean;
}

const ProgressCard = ({
  title,
  count,
  icon: Icon,
  isLoading = false,
}: ProgressCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            {isLoading ? (
              <h3 className="text-sm">Loading...</h3>
            ) : (
              <h3 className="text-xl font-semibold">{count}</h3>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressCard;

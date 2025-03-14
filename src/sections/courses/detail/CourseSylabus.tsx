import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLearningObjectives } from "@/hooks/use-learning-objectives";
import { Check } from "lucide-react";
import React from "react";

interface CourseSylabusProps {
  courseId: string;
}

const CourseSylabus = ({ courseId }: CourseSylabusProps) => {
  const { data, isLoading } = useLearningObjectives(courseId);

  const objectives = data || [];

  if (isLoading) {
    return <SylabusSkeleton />;
  }

  if (objectives?.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Apa yang akan Anda pelajari dalam Course ini</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {objectives?.map((item: any, index: number) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const SylabusSkeleton = () => {
  return (
    <div className="border rounded-lg p-6 mb-6 bg-white">
      <Skeleton className="h-7 w-72 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="flex items-start gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseSylabus;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import React from "react";

const CourseSylabus = ({ courseMock }: any) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>What You Will Learn in This Course</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courseMock.whatYouWillLearn.map((item: any, index: number) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseSylabus;

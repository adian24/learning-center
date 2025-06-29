import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Building2,
  ShieldCheck,
  Globe,
  MapPin,
} from "lucide-react";
import ResourceDrawer from "@/sections/my-course/ResourceDrawer";
import { Course } from "@/hooks/use-course";
import { AvatarImage } from "@/components/media/SecureImage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CourseSidebarProps {
  course: Course;
  progressPercentage: number;
  completedChapters: number;
  totalChapters: number;
  isCompleted: boolean;
}

const CourseSidebar = ({
  course,
  progressPercentage,
  completedChapters,
  totalChapters,
  isCompleted,
}: CourseSidebarProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(
    null
  );

  const handleResourceClick = (resourceId: string) => {
    setSelectedResourceId(resourceId);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedResourceId(null);
  };

  const company = course.teacher?.company;

  return (
    <div className="space-y-6">
      {/* Course Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Progress Kursus</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Penyelesaian</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          <div className="text-sm text-muted-foreground">
            {completedChapters} dari {totalChapters} bab selesai
          </div>
        </CardContent>
      </Card>

      {/* Certificate Card */}
      {isCompleted && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <div>
                <h3 className="font-medium text-green-800">Selamat!</h3>
                <p className="text-sm text-green-700">
                  Anda telah menyelesaikan semua bab dalam kursus ini.
                </p>
              </div>
              <Button
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Unduh Sertifikat
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Instructor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Instruktur</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-start gap-3">
            <AvatarImage
              imageKey={course.teacher?.user?.image}
              userName={course.teacher?.user?.name || "Instruktur"}
              size={40}
              className="flex-shrink-0"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {course.teacher?.user?.name || "Instruktur"}
              </p>
              <p className="text-xs text-muted-foreground">Instruktur Kursus</p>

              {/* Company Information */}
              {company && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                  <div className="flex items-start gap-2">
                    {company.logoUrl && (
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <img
                          src={company.logoUrl}
                          alt={company.name}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        <AvatarFallback className="text-xs">
                          {company.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium">
                          {company.name}
                        </span>
                        {company.isVerified && (
                          <ShieldCheck className="h-3 w-3 text-blue-500" />
                        )}
                      </div>
                      {company.industry && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {company.industry}
                        </p>
                      )}

                      {/* Additional company details */}
                      <div className="space-y-1 mt-2">
                        {company.location && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{company.location}</span>
                          </div>
                        )}
                        {company.website && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 hover:underline"
                            >
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {course.teacher?.bio && (
            <p className="text-xs text-muted-foreground mt-3 line-clamp-3">
              {course.teacher.bio}
            </p>
          )}
        </CardContent>
      </Card>

      <ResourceDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        resourceId={selectedResourceId}
      />
    </div>
  );
};

export default CourseSidebar;

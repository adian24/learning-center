"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { Skeleton } from "@/components/ui/skeleton";
// import ResourcesList from "./ResourcesList";
// import TeacherResourcesManager from "./TeacherResourcesManager";

interface ResourcesTabContentProps {
  chapterId: string;
  onResourceComplete?: () => void;
}

const ResourcesTabContent: React.FC<ResourcesTabContentProps> = ({
  chapterId,
  onResourceComplete,
}) => {
  const { isTeacher, isStudent, isLoading, error } = useUserRole();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-9 w-24" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Gagal memuat informasi pengguna. Silakan refresh halaman.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isTeacher) {
    // Show teacher interface for resource management
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            {/* <TeacherResourcesManager chapterId={chapterId} /> */}
            Teacher Resources Manager - Coming Soon
          </div>
        </CardContent>
      </Card>
    );
  } else if (isStudent) {
    // Show student interface for reading resources
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            {/* <ResourcesList chapterId={chapterId} onResourceComplete={onResourceComplete} /> */}
            Student Resources List - Coming Soon
          </div>
        </CardContent>
      </Card>
    );
  } else {
    // User doesn't have teacher or student profile
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Anda perlu mendaftar sebagai teacher atau student untuk mengakses
              artikel.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
};

export default ResourcesTabContent;
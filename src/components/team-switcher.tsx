"use client";

import * as React from "react";
import { GraduationCap } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUserRole } from "@/hooks/use-user-role";
import { useSecureImages } from "@/hooks/use-secure-media";
import { AvatarImage } from "./media/SecureImage";

export function TeamSwitcher() {
  const { role, teacher } = useUserRole();

  // For teacher with company, prepare company logo for secure image loading
  const companyImageKeys = React.useMemo(() => {
    if (role === "TEACHER" && teacher?.company?.logoUrl) {
      return [{ key: teacher.company.logoUrl }];
    }
    return [];
  }, [role, teacher?.company?.logoUrl]);

  const { imageUrls: logoUrls } = useSecureImages(
    companyImageKeys,
    companyImageKeys.length > 0
  );

  // Determine what to display based on role and company
  const getDisplayData = () => {
    if (role === "TEACHER" && teacher?.company) {
      // Teacher with company
      return {
        logo: teacher.company.logoUrl
          ? logoUrls[teacher.company.logoUrl]
          : null,
        title: teacher.company.name,
        subtitle: teacher.company.industry || "Perusahaan",
        fallback: teacher.company.name.charAt(0),
      };
    } else {
      // Student or Teacher without company
      return {
        logo: null,
        title: "Learning Center",
        subtitle:
          role === "STUDENT" ? "Platform Pembelajaran" : "Portal Pengajar",
        fallback: "LC",
        showIcon: true,
      };
    }
  };

  const displayData = getDisplayData();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="cursor-default">
          {displayData.showIcon ? (
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <GraduationCap className="size-4" />
            </div>
          ) : (
            <Avatar className="size-8">
              {teacher.company.logoUrl ? (
                <AvatarImage
                  imageKey={teacher.company.logoUrl || undefined}
                  userName={displayData.title}
                />
              ) : (
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                  {displayData.fallback}
                </AvatarFallback>
              )}
            </Avatar>
          )}
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{displayData.title}</span>
            <span className="truncate text-xs text-muted-foreground">
              {displayData.subtitle}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

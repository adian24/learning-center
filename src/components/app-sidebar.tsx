"use client";

import * as React from "react";
import {
  UsersRound,
  ChartArea,
  Compass,
  LayoutDashboard,
  GraduationCap,
  UserRoundCheck,
  ShoppingCart,
  TicketCheck,
} from "lucide-react";

import { NavStudent } from "@/components/nav-student";
import { NavTeacher } from "@/components/nav-teacher";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarOption } from "./sidebar-option";

// This is sample data.
const data = {
  teams: [
    {
      name: "Student",
      logo: UserRoundCheck,
      plan: "0 Enrollments",
    },
    {
      name: "Teacher",
      logo: GraduationCap,
      plan: "0 Courses",
    },
  ],
  navStudent: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "My Courses",
      url: "/my-courses",
      icon: Compass,
    },
    {
      title: "Certificates",
      url: "/certificates",
      icon: TicketCheck,
    },
    {
      title: "Shop",
      url: "/courses",
      icon: ShoppingCart,
    },
  ],
  navTeacher: [
    {
      name: "Dashboard",
      url: "/teacher/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Courses",
      url: "/teacher/courses",
      icon: Compass,
    },
    {
      name: "Students",
      url: "/teacher/students",
      icon: UsersRound,
    },
    {
      name: "Analytics",
      url: "/teacher/analytics",
      icon: ChartArea,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavStudent items={data.navStudent} />
        <NavTeacher items={data.navTeacher} />
      </SidebarContent>
      <SidebarFooter>
        <div className="p-1">
          <SidebarOption />
        </div>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Frame,
  Map,
  PieChart,
  Compass,
  LayoutDashboard,
  GraduationCap,
  UserRoundCheck,
  ShoppingCart,
  TicketCheck,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

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
      title: "My Course",
      url: "/courses",
      icon: Compass,
    },
    {
      title: "Sertifikat",
      url: "/certificates",
      icon: TicketCheck,
    },
    {
      title: "Shop",
      url: "/shop",
      icon: ShoppingCart,
    },
  ],
  navTeacher: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
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
        <NavMain items={data.navStudent} />
        <NavProjects projects={data.navTeacher} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

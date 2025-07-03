"use client";

import ButtonNavigation from "@/components/button-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/layout";
import {
  BarChart,
  BookOpen,
  Building2,
  GraduationCap,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  useTeacherStats,
  useTeacherCourses,
} from "@/hooks/use-teacher-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUserRole } from "@/hooks/use-user-role";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/media/SecureImage";
import { useTranslations } from "next-intl";

// Create a client
const queryClient = new QueryClient();

function TeacherDashboardContent() {
  const t = useTranslations("dashboard_teacher");

  const { profile } = useUserRole();
  const { stats, isLoading: statsLoading } = useTeacherStats();
  const { courses, isLoading: coursesLoading } = useTeacherCourses();

  const company = profile?.company;

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Layout>
      {/* Top Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
              <p className="text-gray-600">
                {t("welcome_back", { name: profile?.user?.name })}
              </p>

              {/* Company Badge */}
              {company && (
                <div className="flex items-center gap-2 mt-2">
                  {company.logoUrl && (
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        imageKey={company.logoUrl}
                        userName={company.name}
                      />
                      <AvatarFallback className="text-xs">
                        {company.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{company.name}</span>
                    {company.isVerified && (
                      <ShieldCheck className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("total_courses")}
              </CardTitle>
              <BookOpen className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats?.totalCourses || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("total_students")}
              </CardTitle>
              <Users className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats?.totalStudents || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("completion_rate")}
              </CardTitle>
              <GraduationCap className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats?.completionRate || 0}%
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("total_revenue")}
              </CardTitle>
              <BarChart className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Management */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t("my_courses")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coursesLoading ? (
                  Array(2)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-64" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    ))
                ) : courses.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    {t("no_courses")}
                  </div>
                ) : (
                  courses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{course.title}</h3>
                        <p className="text-sm text-gray-500">
                          {" "}
                          {course.studentsEnrolled} {t("students_enrolled")}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${
                          course.status === "Published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("quick_actions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ButtonNavigation
                  text={t("create_new_course")}
                  className="w-full text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  url="/teacher/courses/create"
                />
                <ButtonNavigation
                  text={t("manage_students")}
                  className="w-full text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  url="/teacher/students"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

export default function TeacherDashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <TeacherDashboardContent />
    </QueryClientProvider>
  );
}

// src/views/dashboard.tsx
"use client";

import { useRouter } from "next/navigation";
import Layout from "@/layout";
import { format } from "date-fns";
import {
  useStudentProfile,
  useStudentCourses,
} from "@/hooks/use-student-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Award,
  ChevronRight,
  Star,
  ArrowUpRight,
  Calendar as CalendarIcon,
  Laptop,
} from "lucide-react";
import { PendingPaymentsWidget } from "@/components/dashboard/PendingPaymentsWidget";
import { useTranslations } from "next-intl";

const Dashboard = () => {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const { data: profile, isLoading: profileLoading } = useStudentProfile();
  const { data: courses, isLoading: coursesLoading } = useStudentCourses();

  // Format date for the welcome message
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d, yyyy");

  const recentCourses = [...(courses || [])]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 3);

  return (
    <Layout>
      {/* Hero Section */}
      <div className="rounded-lg bg-gradient-to-r from-teal-100 to-fuchsia-100 max-w-6xl mx-auto">
        <div className="px-4 container mx-auto max-w-6xl sm:px-6 lg:px-0 py-8 md:py-8">
          <div className="items-center md:px-8">
            {/* Profile Information */}
            <div className="col-span-2">
              <div className="flex items-center gap-4 mb-4">
                {profileLoading ? (
                  <Skeleton className="h-16 w-16 rounded-full" />
                ) : (
                  <Avatar className="h-16 w-16 border-2 border-white">
                    <AvatarImage
                      src={profile?.image || ""}
                      alt={profile?.name || ""}
                    />
                    <AvatarFallback className="bg-primary text-white">
                      {profile?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <h1 className="text-2xl font-bold mb-1">
                    {profileLoading ? (
                      <Skeleton className="h-8 w-48" />
                    ) : (
                      <>
                        {t("welcome_back", {
                          name: profile?.name || "Student",
                        })}
                      </>
                    )}
                  </h1>
                  <p className="text-muted-foreground flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {formattedDate}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    <span className="font-medium">
                      {t("experience_points")}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {profileLoading ? (
                      <Skeleton className="h-5 w-16 inline-block" />
                    ) : (
                      `${profile?.currentXP || 0} / ${profile?.maxXP || 100} XP`
                    )}
                  </span>
                </div>

                {profileLoading ? (
                  <Skeleton className="h-2 w-full" />
                ) : (
                  <Progress
                    value={
                      ((profile?.currentXP || 0) / (profile?.maxXP || 0)) *
                        100 || 0
                    }
                    className="h-2 border border-gray-300"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 sm:px-0 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Course Activity */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>{t("my_recent_courses")}</CardTitle>
                  <Button
                    variant="link"
                    onClick={() => router.push("/my-courses")}
                    className="text-primary"
                  >
                    {t("view_all")}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <CardDescription>{t("continue_learning")}</CardDescription>
              </CardHeader>
              <CardContent>
                {coursesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <Skeleton className="h-6 w-64" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="h-2 w-full mb-1" />
                        <div className="flex justify-between items-center mt-3">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-9 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentCourses.length > 0 ? (
                  <div className="space-y-4">
                    {recentCourses.map((course) => {
                      const getProgressColor = (progress: number) => {
                        if (progress === 0)
                          return "from-gray-50 to-gray-100 border-gray-200";
                        if (progress < 25)
                          return "from-red-50 to-rose-100 border-red-200";
                        if (progress < 50)
                          return "from-orange-50 to-amber-100 border-orange-200";
                        if (progress < 75)
                          return "from-yellow-50 to-lime-100 border-yellow-200";
                        if (progress < 100)
                          return "from-blue-50 to-cyan-100 border-blue-200";
                        return "from-green-50 to-emerald-100 border-green-200";
                      };

                      const getProgressBarColor = (progress: number) => {
                        if (progress === 0) return "bg-gray-300";
                        if (progress < 25)
                          return "bg-gradient-to-r from-red-400 to-rose-500";
                        if (progress < 50)
                          return "bg-gradient-to-r from-orange-400 to-amber-500";
                        if (progress < 75)
                          return "bg-gradient-to-r from-yellow-400 to-lime-500";
                        if (progress < 100)
                          return "bg-gradient-to-r from-blue-400 to-cyan-500";
                        return "bg-gradient-to-r from-green-400 to-emerald-500";
                      };

                      const getBadgeStyle = (progress: number) => {
                        if (progress === 0)
                          return "bg-gray-100 text-gray-700 border-gray-300";
                        if (progress < 25)
                          return "bg-red-100 text-red-700 border-red-300";
                        if (progress < 50)
                          return "bg-orange-100 text-orange-700 border-orange-300";
                        if (progress < 75)
                          return "bg-yellow-100 text-yellow-700 border-yellow-300";
                        if (progress < 100)
                          return "bg-blue-100 text-blue-700 border-blue-300";
                        return "bg-green-100 text-green-700 border-green-300";
                      };

                      const getButtonColor = (progress: number) => {
                        if (progress === 0)
                          return "bg-gray-600 hover:bg-gray-700 text-white";
                        if (progress < 25)
                          return "bg-red-500 hover:bg-red-600 text-white";
                        if (progress < 50)
                          return "bg-orange-500 hover:bg-orange-600 text-white";
                        if (progress < 75)
                          return "bg-yellow-500 hover:bg-yellow-600 text-white";
                        if (progress < 100)
                          return "bg-blue-500 hover:bg-blue-600 text-white";
                        return "bg-green-500 hover:bg-green-600 text-white";
                      };

                      return (
                        <Card
                          key={course.id}
                          className={`transition-all duration-300 hover:shadow-lg hover:scale-[1.02] pt-6 bg-gradient-to-br ${getProgressColor(
                            course.progress
                          )}`}
                        >
                          <CardContent>
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="font-semibold text-lg text-gray-800 leading-tight">
                                {course.title}
                              </h3>
                              <div
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getBadgeStyle(
                                  course.progress
                                )}`}
                              >
                                {course.progress === 100
                                  ? t("completed")
                                  : `${course.progress}%`}
                              </div>
                            </div>

                            <div className="mb-4">
                              <div className="bg-white/70 rounded-md h-3 overflow-hidden shadow-inner">
                                <div
                                  className={`h-full transition-all duration-500 ${getProgressBarColor(
                                    course.progress
                                  )} shadow-sm`}
                                  style={{ width: `${course.progress}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <div className="flex items-center text-sm font-medium text-gray-600">
                                <BookOpen className="h-4 w-4 mr-2" />
                                <span>
                                  {course.completedChapters}/
                                  {course.chaptersCount} {t("chapters")}
                                </span>
                              </div>
                              <Button
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${getButtonColor(
                                  course.progress
                                )} shadow-sm hover:shadow-md`}
                                onClick={() =>
                                  router.push(`/my-courses/${course.id}`)
                                }
                              >
                                {course.progress === 0
                                  ? t("start")
                                  : course.progress === 100
                                  ? t("review")
                                  : t("continue")}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="font-medium text-lg mb-2">
                      {t("no_courses")}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t("start_learning")}
                    </p>
                    <Button onClick={() => router.push("/courses")}>
                      {t("browse_courses")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <PendingPaymentsWidget />

            <Card>
              <CardHeader>
                <CardTitle>{t("quick_links")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button
                  variant="outline"
                  className="justify-between"
                  onClick={() => router.push("/my-courses")}
                >
                  <div className="flex items-center">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>{tCommon("my_courses")}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="justify-between"
                  onClick={() => router.push("/courses")}
                >
                  <div className="flex items-center">
                    <Star className="mr-2 h-4 w-4" />
                    <span>{t("browse_courses")}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="justify-between"
                  onClick={() => router.push("/certificates")}
                >
                  <div className="flex items-center">
                    <Award className="mr-2 h-4 w-4" />
                    <span>{t("my_certificates")}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="justify-between"
                  onClick={() => router.push("/careers")}
                >
                  <div className="flex items-center">
                    <Laptop className="mr-2 h-4 w-4" />
                    <span>Search Career</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

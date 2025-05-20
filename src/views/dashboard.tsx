// src/views/dashboard.tsx
"use client";

import { useRouter } from "next/navigation";
import Layout from "@/layout";
import { format } from "date-fns";
import {
  useStudentProfile,
  useStudentProgress,
  useStudentAchievements,
  useStudentCourses,
} from "@/hooks/use-student-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Clock,
  Award,
  ChevronRight,
  Calendar,
  BarChart3,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowUpRight,
  GraduationCap,
  Calendar as CalendarIcon,
} from "lucide-react";
import { PendingPaymentsWidget } from "@/components/dashboard/PendingPaymentsWidget";

const Dashboard = () => {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useStudentProfile();
  const { data: progress, isLoading: progressLoading } = useStudentProgress();
  const { data: achievements, isLoading: achievementsLoading } =
    useStudentAchievements();
  const { data: courses, isLoading: coursesLoading } = useStudentCourses();

  // Format date for the welcome message
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d, yyyy");

  // Calculate course statistics
  const inProgressCourses =
    courses?.filter((course) => course.progress > 0 && course.progress < 100) ||
    [];
  const completedCourses =
    courses?.filter((course) => course.progress === 100) || [];
  const recentCourses = [...(courses || [])]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 3);

  // Calculate activity streak (placeholder - would ideally come from API)
  const activityStreak = 5;

  // Calculate next achievement
  const nextAchievement = {
    title: "Course Completer",
    description: "Complete your first course",
    progress:
      completedCourses.length > 0
        ? 100
        : inProgressCourses.length > 0
        ? Math.max(...inProgressCourses.map((c) => c.progress))
        : 0,
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="rounded-lg bg-gradient-to-r from-teal-100 to-fuchsia-100 max-w-6xl mx-auto">
        <div className="px-4 container mx-auto max-w-6xl sm:px-6 lg:px-0 py-8 md:py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center md:px-8">
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
                      `Welcome back, ${profile?.name || "Student"}!`
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
                    <span className="font-medium">Experience Points</span>
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

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Button
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => router.push("/my-courses")}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  My Courses
                </Button>
                <Button variant="outline">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Certificates
                </Button>
                <Button variant="outline" className="hidden sm:flex">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {progressLoading ? (
                      <Skeleton className="h-10 w-10" />
                    ) : (
                      progress?.inProgress || 0
                    )}
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    In Progress
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {progressLoading ? (
                      <Skeleton className="h-10 w-10" />
                    ) : (
                      progress?.completed || 0
                    )}
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    Completed
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {progressLoading ? (
                      <Skeleton className="h-10 w-10" />
                    ) : (
                      progress?.totalPoints || 0
                    )}
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    Points
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {activityStreak}
                    </div>
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400 ml-1" />
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    Day Streak
                  </p>
                </div>
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
                  <CardTitle>My Recent Courses</CardTitle>
                  <Button
                    variant="link"
                    onClick={() => router.push("/my-courses")}
                    className="text-primary"
                  >
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <CardDescription>Continue where you left off</CardDescription>
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
                    {recentCourses.map((course) => (
                      <div
                        key={course.id}
                        className="border rounded-lg hover:border-primary transition-colors p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium">{course.title}</h3>
                          <Badge
                            variant={
                              course.progress === 100 ? "default" : "secondary"
                            }
                          >
                            {course.progress === 100
                              ? "Completed"
                              : `${course.progress}%`}
                          </Badge>
                        </div>
                        <Progress
                          value={course.progress}
                          className="h-2 mb-3"
                        />
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4 mr-1" />
                            <span>
                              {course.completedChapters}/{course.chaptersCount}{" "}
                              chapters
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => router.push(`/courses/${course.id}`)}
                          >
                            {course.progress === 0
                              ? "Start"
                              : course.progress === 100
                              ? "Review"
                              : "Continue"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="font-medium text-lg mb-2">No courses yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start your learning journey by enrolling in a course
                    </p>
                    <Button onClick={() => router.push("/courses")}>
                      Browse Courses
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learning insights */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Insights</CardTitle>
                <CardDescription>
                  Your learning activity and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="progress">
                  <TabsList className="mb-4">
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>

                  <TabsContent value="progress">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Course Completion */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Course Completion</h3>
                            <p className="text-xs text-muted-foreground">
                              Overall progress
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 text-center">
                          {coursesLoading ? (
                            <Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" />
                          ) : courses && courses.length > 0 ? (
                            <>
                              <div className="relative inline-block">
                                <svg className="w-32 h-32" viewBox="0 0 36 36">
                                  <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#eee"
                                    strokeWidth="3"
                                  />
                                  <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="3"
                                    strokeDasharray={`${
                                      courses.reduce(
                                        (sum, course) => sum + course.progress,
                                        0
                                      ) / courses.length
                                    }, 100`}
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="text-xl font-semibold">
                                    {Math.round(
                                      courses.reduce(
                                        (sum, course) => sum + course.progress,
                                        0
                                      ) / courses.length
                                    )}
                                    %
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {completedCourses.length} of {courses.length}{" "}
                                courses completed
                              </div>
                            </>
                          ) : (
                            <p className="text-muted-foreground py-4">
                              No course data available
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Next Goal */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-amber-100 p-2 rounded-full">
                            <Award className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Next Achievement</h3>
                            <p className="text-xs text-muted-foreground">
                              Your current goal
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="font-medium mb-1">
                            {nextAchievement.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {nextAchievement.description}
                          </p>
                          <Progress
                            value={nextAchievement.progress}
                            className="h-2 mb-2"
                          />
                          <div className="text-right text-sm">
                            {nextAchievement.progress}% complete
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="achievements">
                    {achievementsLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="border rounded-lg p-4">
                            <Skeleton className="h-6 w-48 mb-2" />
                            <div className="flex justify-between">
                              <Skeleton className="h-5 w-24" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : achievements && achievements.length > 0 ? (
                      <div className="space-y-3">
                        {achievements.map((achievement) => (
                          <div
                            key={achievement.id}
                            className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
                                <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                              </div>
                              <span>{achievement.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                              >
                                {achievement.xp} XP
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="font-medium text-lg mb-2">
                          No achievements yet
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Complete learning activities to earn achievements
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="activity">
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">Activity Streak</h3>
                            <p className="text-xs text-muted-foreground">
                              Keep learning daily
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center gap-1">
                            {Array(7)
                              .fill(0)
                              .map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                                    i < activityStreak
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-100 text-gray-400"
                                  }`}
                                >
                                  {i < activityStreak ? (
                                    <CheckCircle className="h-4 w-4" />
                                  ) : (
                                    i + 1
                                  )}
                                </div>
                              ))}
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {activityStreak} day streak
                          </Badge>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-3">Recent Activity</h3>
                        <div className="space-y-3">
                          {recentCourses.slice(0, 2).map((course, index) => (
                            <div
                              key={index}
                              className="flex gap-3 pb-3 border-b last:border-0"
                            >
                              <div className="bg-blue-100 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                                <BookOpen className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {course.progress < 100
                                    ? "Continued"
                                    : "Completed"}{" "}
                                  {course.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(
                                    new Date(course.updatedAt),
                                    "MMM d, h:mm a"
                                  )}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <PendingPaymentsWidget />

            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button
                  variant="outline"
                  className="justify-between"
                  onClick={() => router.push("/my-courses")}
                >
                  <div className="flex items-center">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>My Courses</span>
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
                    <span>Browse Courses</span>
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
                    <span>My Certificates</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="justify-between">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Learning Schedule</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Achievements Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Your Achievements</CardTitle>
                <CardDescription>Keep learning to earn more</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievementsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((item) => (
                      <Skeleton key={item} className="h-12 w-full" />
                    ))}
                  </div>
                ) : achievements && achievements.length > 0 ? (
                  achievements.slice(0, 3).map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-100 p-2 rounded-full">
                          <Award className="h-4 w-4 text-amber-600" />
                        </div>
                        <span className="text-sm">{achievement.title}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700"
                      >
                        {achievement.xp} XP
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      No achievements yet
                    </p>
                  </div>
                )}
                {achievements && achievements.length > 0 && (
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground"
                  >
                    View All Achievements
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Deadlines or Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended for You</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border overflow-hidden">
                  <div className="aspect-video bg-blue-100 flex items-center justify-center relative">
                    <BookOpen className="h-8 w-8 text-blue-500" />
                    <Badge className="absolute top-2 right-2">Popular</Badge>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm">
                      Advanced Web Development
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Learn modern frameworks and tools
                    </p>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => router.push("/courses")}
                    >
                      View Course
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

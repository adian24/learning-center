"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useGroupedEnrollments,
  useCancelEnrollment,
} from "@/hooks/use-enrolled-courses";
import { useEnrollmentStats } from "@/hooks/use-student-stats";
import { useCourseProgress } from "@/hooks/use-chapter-progress";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseImageCard } from "@/components/media/SecureImage";

import {
  BookOpen,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  CreditCard,
  LayoutGrid,
  List,
  Search,
  FileQuestion,
  Loader2,
} from "lucide-react";
import Layout from "@/layout";

// Stats card interface
interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  className?: string;
}

// Stats Card Component
const StatsCard = ({ icon, title, count, className = "" }: StatsCardProps) => (
  <Card className={`${className}`}>
    <CardContent className="flex items-center p-6">
      <div
        className={`rounded-full p-4 mr-4 ${
          title === "Total Kursus"
            ? "bg-blue-50"
            : title === "Sedang Berlangsung"
            ? "bg-amber-50"
            : "bg-green-50"
        }`}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-muted-foreground text-sm">{title}</h3>
        <p className="text-3xl font-bold">{count}</p>
      </div>
    </CardContent>
  </Card>
);

const MyCourses = () => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<string>("all-courses");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("last-updated");
  const [cancellingEnrollmentId, setCancellingEnrollmentId] = useState<
    string | null
  >(null);

  const { enrollments, isLoading, error } = useGroupedEnrollments();
  const cancelEnrollment = useCancelEnrollment(
    cancellingEnrollmentId || undefined
  );

  // Get stats from the hook
  const { stats: enrollmentStats, isLoading: statsLoading } =
    useEnrollmentStats();

  useEffect(() => {
    // If URL has query params for tab, use them
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab) {
      switch (tab) {
        case "pending":
          setSelectedTab("pending-payment");
          break;
        case "failed":
          setSelectedTab("failed");
          break;
        case "in-progress":
          setSelectedTab("in-progress");
          break;
        default:
          setSelectedTab("all-courses");
      }
    }
  }, []);

  const handleContinuePayment = (enrollmentId: string, courseId: string) => {
    router.push(
      `/courses/${courseId}/payment?method=pending&enrollment=${enrollmentId}`
    );
  };

  const handleCancelEnrollment = async () => {
    if (cancellingEnrollmentId) {
      await cancelEnrollment.mutateAsync();
      setCancellingEnrollmentId(null);
    }
  };

  // Filter courses based on search query
  const filterCourses = (courses: any[]) => {
    if (!searchQuery) return courses;

    return courses.filter((enrollment) =>
      enrollment.course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Sort courses based on selected order
  const sortCourses = (courses: any[]) => {
    switch (sortOrder) {
      case "last-updated":
        return [...courses].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      case "title-asc":
        return [...courses].sort((a, b) =>
          a.course.title.localeCompare(b.course.title)
        );
      case "title-desc":
        return [...courses].sort((a, b) =>
          b.course.title.localeCompare(a.course.title)
        );
      case "progress-asc":
        return [...courses].sort((a, b) => a.progress - b.progress);
      case "progress-desc":
        return [...courses].sort((a, b) => b.progress - a.progress);
      default:
        return courses;
    }
  };

  // Filter and sort all courses
  const allCoursesFiltered = sortCourses(
    filterCourses([
      ...enrollments.completed,
      ...enrollments.pending,
      ...enrollments.failed,
    ])
  );

  // Filter and sort in-progress courses - we'll filter based on actual progress in the component
  const inProgressCoursesFiltered = sortCourses(
    filterCourses(enrollments.completed)
  );

  // Filter and sort pending courses
  const pendingCoursesFiltered = sortCourses(
    filterCourses(enrollments.pending)
  );

  // Filter and sort failed courses
  const failedCoursesFiltered = sortCourses(filterCourses(enrollments.failed));

  // Loading states
  if (isLoading || statsLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Kursus Saya</h1>
            <p className="text-muted-foreground">
              Lacak dan lanjutkan perjalanan belajar Anda
            </p>
          </div>
        </div>

        <div className="flex justify-between mb-6">
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        <Skeleton className="h-10 w-full mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Terjadi kesalahan</h2>
            <p className="text-gray-600 mb-4">
              Kami tidak dapat memuat kursus Anda. Silakan coba lagi nanti.
            </p>
            <Button onClick={() => window.location.reload()}>Segarkan</Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Empty state
  if (enrollmentStats.total === 0) {
    return (
      <Layout>
        <div className="container mx-auto max-w-7xl py-8 px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold">Kursus Saya</h1>
              <p className="text-muted-foreground">
                Lacak dan lanjutkan perjalanan belajar Anda
              </p>
            </div>
            <Button onClick={() => router.push("/courses")}>
              Jelajahi Kursus
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              icon={<BookOpen className="h-6 w-6 text-blue-500" />}
              title="Total Kursus"
              count={0}
            />
            <StatsCard
              icon={<Clock className="h-6 w-6 text-amber-500" />}
              title="Sedang Berlangsung"
              count={0}
            />
            <StatsCard
              icon={<CheckCircle className="h-6 w-6 text-green-500" />}
              title="Selesai"
              count={0}
            />
          </div>

          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Belum ada kursus</h2>
            <p className="text-gray-600 mb-4 max-w-md">
              Anda belum mendaftar di kursus manapun. Jelajahi katalog kami
              untuk menemukan sesuatu untuk dipelajari!
            </p>
            <Button onClick={() => router.push("/courses")}>
              Jelajahi Kursus
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Kursus Saya</h1>
            <p className="text-muted-foreground">
              Lacak dan lanjutkan perjalanan belajar Anda
            </p>
          </div>
          <Button onClick={() => router.push("/courses")}>
            Jelajahi Kursus
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Cari kursus Anda..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Urutkan berdasarkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-updated">Terakhir Diperbarui</SelectItem>
              <SelectItem value="title-asc">Judul (A-Z)</SelectItem>
              <SelectItem value="title-desc">Judul (Z-A)</SelectItem>
              <SelectItem value="progress-asc">
                Progres (Rendah-Tinggi)
              </SelectItem>
              <SelectItem value="progress-desc">
                Progres (Tinggi-Rendah)
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              variant={viewType === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewType("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewType === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewType("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            icon={<BookOpen className="h-6 w-6 text-blue-500" />}
            title="Total Kursus"
            count={enrollmentStats.total}
          />
          <StatsCard
            icon={<Clock className="h-6 w-6 text-amber-500" />}
            title="Sedang Berlangsung"
            count={enrollmentStats.inProgress}
          />
          <StatsCard
            icon={<CheckCircle className="h-6 w-6 text-green-500" />}
            title="Selesai"
            count={enrollmentStats.completed}
          />
        </div>

        <Tabs
          defaultValue="all-courses"
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="mb-8">
            <TabsTrigger value="all-courses">Semua Kursus</TabsTrigger>
            <TabsTrigger value="in-progress">Sedang Berlangsung</TabsTrigger>
            <TabsTrigger value="pending-payment">
              Menunggu Pembayaran
              {enrollments.pending.length > 0 && (
                <Badge className="ml-2 bg-amber-100 text-amber-900">
                  {enrollments.pending.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="failed">
              Gagal
              {enrollments.failed.length > 0 && (
                <Badge className="ml-2 bg-red-100 text-red-900">
                  {enrollments.failed.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* All Courses */}
          <TabsContent value="all-courses" className="space-y-8">
            {allCoursesFiltered.length > 0 ? (
              viewType === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allCoursesFiltered.map((enrollment) => (
                    <EnhancedCourseCard
                      key={enrollment.id}
                      enrollment={enrollment}
                      viewType={viewType}
                      onContinuePayment={handleContinuePayment}
                      onCancelClick={setCancellingEnrollmentId}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {allCoursesFiltered.map((enrollment) => (
                    <EnhancedCourseCard
                      key={enrollment.id}
                      enrollment={enrollment}
                      viewType={viewType}
                      onContinuePayment={handleContinuePayment}
                      onCancelClick={setCancellingEnrollmentId}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  Tidak ada kursus ditemukan
                </h3>
                <p className="text-gray-600 mb-4">
                  Tidak ada kursus yang sesuai dengan kriteria pencarian Anda.
                </p>
              </div>
            )}
          </TabsContent>

          {/* In Progress */}
          <TabsContent value="in-progress" className="space-y-8">
            <InProgressCourseList
              enrollments={inProgressCoursesFiltered}
              viewType={viewType}
              onContinuePayment={handleContinuePayment}
              onCancelClick={setCancellingEnrollmentId}
            />
          </TabsContent>

          {/* Pending Payment */}
          <TabsContent value="pending-payment" className="space-y-8">
            {pendingCoursesFiltered.length > 0 ? (
              viewType === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingCoursesFiltered.map((enrollment) => (
                    <EnhancedCourseCard
                      key={enrollment.id}
                      enrollment={enrollment}
                      viewType={viewType}
                      onContinuePayment={handleContinuePayment}
                      onCancelClick={setCancellingEnrollmentId}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingCoursesFiltered.map((enrollment) => (
                    <EnhancedCourseCard
                      key={enrollment.id}
                      enrollment={enrollment}
                      viewType={viewType}
                      onContinuePayment={handleContinuePayment}
                      onCancelClick={setCancellingEnrollmentId}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <CreditCard className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  Tidak ada pembayaran tertunda
                </h3>
                <p className="text-gray-600 mb-4">
                  Anda tidak memiliki kursus dengan pembayaran tertunda.
                </p>
                <Button onClick={() => router.push("/courses")}>
                  Jelajahi Kursus
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Failed */}
          <TabsContent value="failed" className="space-y-8">
            {failedCoursesFiltered.length > 0 ? (
              viewType === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {failedCoursesFiltered.map((enrollment) => (
                    <EnhancedCourseCard
                      key={enrollment.id}
                      enrollment={enrollment}
                      viewType={viewType}
                      onContinuePayment={handleContinuePayment}
                      onCancelClick={setCancellingEnrollmentId}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {failedCoursesFiltered.map((enrollment) => (
                    <EnhancedCourseCard
                      key={enrollment.id}
                      enrollment={enrollment}
                      viewType={viewType}
                      onContinuePayment={handleContinuePayment}
                      onCancelClick={setCancellingEnrollmentId}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  Tidak ada pembayaran gagal
                </h3>
                <p className="text-gray-600 mb-4">
                  Bagus! Anda tidak memiliki kursus dengan pembayaran yang
                  gagal.
                </p>
                <Button onClick={() => setSelectedTab("all-courses")}>
                  Lihat Semua Kursus
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Cancel Enrollment Dialog */}
        <AlertDialog
          open={!!cancellingEnrollmentId}
          onOpenChange={(open) => !open && setCancellingEnrollmentId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Batalkan Pendaftaran?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin membatalkan pendaftaran ini? Tindakan
                ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Pertahankan Pendaftaran</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelEnrollment}
                className="bg-red-600 hover:bg-red-700"
                disabled={cancelEnrollment.isPending}
              >
                {cancelEnrollment.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Membatalkan...
                  </>
                ) : (
                  "Ya, Batalkan"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

interface CourseCardProps {
  enrollment: any;
  viewType: "grid" | "list";
  onContinuePayment: (enrollmentId: string, courseId: string) => void;
  onCancelClick: (enrollmentId: string) => void;
}

interface EnhancedCourseCardProps {
  enrollment: any;
  viewType: "grid" | "list";
  onContinuePayment: (enrollmentId: string, courseId: string) => void;
  onCancelClick: (enrollmentId: string) => void;
}

interface InProgressFilterProps {
  enrollments: any[];
  viewType: "grid" | "list";
  onContinuePayment: (enrollmentId: string, courseId: string) => void;
  onCancelClick: (enrollmentId: string) => void;
}

const EnhancedCourseCard = ({
  enrollment,
  viewType,
  onContinuePayment,
  onCancelClick,
}: EnhancedCourseCardProps) => {
  const router = useRouter();

  // Get course progress data for completed enrollments only
  const { data: courseProgressData } = useCourseProgress(enrollment.courseId);

  // Calculate progress from course progress data
  const totalChapters = courseProgressData?.courseProgress?.length || 0;
  const completedChapters =
    courseProgressData?.courseProgress?.filter(
      (ch) => ch.userProgress?.isCompleted
    ).length || 0;
  const progress =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;

  // Helper to determine card styles based on status
  const getStatusConfig = () => {
    switch (enrollment.status) {
      case "COMPLETED":
        return {
          badge: {
            element:
              progress === 100 ? (
                <Badge className="bg-green-100 text-green-800">Selesai</Badge>
              ) : progress > 0 && progress < 100 ? (
                <Badge className="bg-blue-100 text-blue-800">
                  Sedang Berlangsung
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-800">
                  Belum Dimulai
                </Badge>
              ),
          },
          actionButton: {
            text: progress === 100 ? "Tinjau Kursus" : "Lanjutkan Belajar",
            onClick: () => router.push(`/my-courses/${enrollment.courseId}`),
            icon: <ArrowRight className="ml-2 h-4 w-4" />,
            variant: "default" as const,
          },
        };
      case "PENDING":
        return {
          badge: {
            element: (
              <Badge className="bg-amber-100 text-amber-800">
                Menunggu Pembayaran
              </Badge>
            ),
          },
          actionButton: {
            text: "Lanjutkan Pembayaran",
            onClick: () =>
              onContinuePayment(enrollment.id, enrollment.courseId),
            icon: <CreditCard className="ml-2 h-4 w-4" />,
            variant: "default" as const,
          },
          secondaryButton: {
            text: "Batalkan",
            onClick: () => onCancelClick(enrollment.id),
            variant: "outline" as const,
          },
        };
      case "FAILED":
        return {
          badge: {
            element: (
              <Badge className="bg-red-100 text-red-800">
                Pembayaran Gagal
              </Badge>
            ),
          },
          actionButton: {
            text: "Coba Lagi",
            onClick: () =>
              router.push(`/courses/${enrollment.courseId}/checkout`),
            icon: <ArrowRight className="ml-2 h-4 w-4" />,
            variant: "outline" as const,
          },
        };
      default:
        return {
          badge: {
            element: <Badge>Tidak Diketahui</Badge>,
          },
          actionButton: {
            text: "Lihat Detail",
            onClick: () => router.push(`/courses/${enrollment.courseId}`),
            icon: <ArrowRight className="ml-2 h-4 w-4" />,
            variant: "outline" as const,
          },
        };
    }
  };

  const statusConfig = getStatusConfig();

  if (viewType === "list") {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Course Image */}
            <div className="relative aspect-video w-full sm:w-48 h-auto rounded-md overflow-hidden">
              <CourseImageCard
                imageKey={enrollment.course.imageUrl}
                courseId={enrollment.course.id}
                courseTitle={enrollment.course.title}
                className="aspect-video w-full"
              />
              <div className="absolute top-2 right-2">
                {statusConfig.badge.element}
              </div>
            </div>

            {/* Course Details */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">
                  {enrollment.course.title}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground gap-2 mb-3">
                  <span>Level: {enrollment.course.level.toLowerCase()}</span>
                  {totalChapters > 0 && (
                    <>
                      <span>•</span>
                      <span>{totalChapters} bab</span>
                    </>
                  )}
                </div>

                {/* Progress bar for active courses */}
                {enrollment.status === "COMPLETED" && totalChapters > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progres</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {completedChapters}/{totalChapters} bab selesai
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 sm:mt-auto justify-end">
                {statusConfig.secondaryButton && (
                  <Button
                    variant={statusConfig.secondaryButton.variant}
                    onClick={statusConfig.secondaryButton.onClick}
                    size="sm"
                  >
                    {statusConfig.secondaryButton.text}
                  </Button>
                )}
                <Button
                  variant={statusConfig.actionButton.variant}
                  onClick={statusConfig.actionButton.onClick}
                  size="sm"
                >
                  {statusConfig.actionButton.text}
                  {statusConfig.actionButton.icon}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      {/* Course Image */}
      <div className="relative aspect-video w-full overflow-hidden">
        <CourseImageCard
          imageKey={enrollment.course.imageUrl}
          courseId={enrollment.course.id}
          courseTitle={enrollment.course.title}
          className="aspect-video w-full"
        />
        <div className="absolute top-2 right-2">
          {statusConfig.badge.element}
        </div>
      </div>

      <CardContent className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold line-clamp-2 mb-1">
          {enrollment.course.title}
        </h3>

        <div className="flex items-center text-sm text-muted-foreground gap-2 mb-3">
          <span className="capitalize">
            {enrollment.course.level.toLowerCase()}
          </span>
          {totalChapters > 0 && (
            <>
              <span>•</span>
              <span>{totalChapters} bab</span>
            </>
          )}
        </div>

        {/* Only show progress bar for completed (active) enrollments */}
        {enrollment.status === "COMPLETED" && totalChapters > 0 && (
          <div className="mt-auto mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Progres</span>
              <span className="font-medium">{progress}% Selesai</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {completedChapters}/{totalChapters} bab selesai
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <Button
            variant={statusConfig.actionButton.variant}
            onClick={statusConfig.actionButton.onClick}
            className="flex-1"
          >
            {statusConfig.actionButton.text}
            {statusConfig.actionButton.icon}
          </Button>

          {statusConfig.secondaryButton && (
            <Button
              variant={statusConfig.secondaryButton.variant}
              onClick={statusConfig.secondaryButton.onClick}
            >
              {statusConfig.secondaryButton.text}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Component that filters in-progress courses based on actual progress
const InProgressCourseList = ({
  enrollments,
  viewType,
  onContinuePayment,
  onCancelClick,
}: InProgressFilterProps) => {
  const router = useRouter();

  const inProgressEnrollments = enrollments.filter((enrollment) => {
    if (enrollment.status !== "COMPLETED") return false;
    return true;
  });

  const courseCards = inProgressEnrollments
    .map((enrollment) => (
      <InProgressCourseCard
        key={enrollment.id}
        enrollment={enrollment}
        viewType={viewType}
        onContinuePayment={onContinuePayment}
        onCancelClick={onCancelClick}
      />
    ))
    .filter(Boolean); // Remove null components

  if (viewType === "grid") {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courseCards}
        </div>
        {courseCards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Clock className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">
              Tidak ada kursus yang sedang berlangsung
            </h3>
            <p className="text-gray-600 mb-4">
              Anda belum memulai kursus apapun atau masih menunggu pembayaran.
            </p>
            <Button onClick={() => router.push("/courses")}>
              Jelajahi Kursus
            </Button>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">{courseCards}</div>
      {courseCards.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Clock className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">
            Tidak ada kursus yang sedang berlangsung
          </h3>
          <p className="text-gray-600 mb-4">
            Anda belum memulai kursus apapun atau masih menunggu pembayaran.
          </p>
          <Button onClick={() => router.push("/courses")}>
            Jelajahi Kursus
          </Button>
        </div>
      )}
    </>
  );
};

// Individual course card that checks if it should render for in-progress
const InProgressCourseCard = ({
  enrollment,
  viewType,
  onContinuePayment,
  onCancelClick,
}: EnhancedCourseCardProps) => {
  const { data: courseProgressData } = useCourseProgress(
    enrollment.status === "COMPLETED" ? enrollment.courseId : undefined
  );

  const totalChapters = courseProgressData?.courseProgress?.length || 0;
  const completedChapters =
    courseProgressData?.courseProgress?.filter(
      (ch) => ch.userProgress?.isCompleted
    ).length || 0;
  const progress =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;

  // Only render if this is actually in progress (0 < progress < 100)
  if (progress === 0 || progress === 100) {
    return null;
  }

  return (
    <EnhancedCourseCard
      enrollment={enrollment}
      viewType={viewType}
      onContinuePayment={onContinuePayment}
      onCancelClick={onCancelClick}
    />
  );
};

export default MyCourses;

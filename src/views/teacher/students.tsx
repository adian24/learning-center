"use client";

import { useState, useEffect } from "react";
import Layout from "@/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
  TrendingUp,
  Loader2,
  Filter,
  Calendar,
  Mail,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useStudents } from "@/hooks/use-students";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

const TeacherStudents = () => {
  const t = useTranslations("students");
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "enrollmentDate" | "progress">(
    "enrollmentDate"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const studentsPerPage = 10;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch students data
  const { students, pagination, stats, isLoading, error, refetch, isFetching } =
    useStudents({
      page: currentPage,
      limit: studentsPerPage,
      search: debouncedSearch,
      sortBy,
      sortOrder,
    });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProgressBadgeVariant = (
    progress: number
  ): "default" | "secondary" | "destructive" => {
    if (progress >= 80) return "default";
    if (progress >= 50) return "secondary";
    return "destructive";
  };

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <p className="text-red-500 mb-4">Gagal memuat data siswa</p>
              <Button onClick={() => window.location.reload()}>
                {t("try_again")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
              <p className="text-gray-600 mt-2">{t("description")}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              {t("refresh")}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t("stat_total")}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.totalStudents || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t("stat_avg_progress")}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.averageProgress || 0}%
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {t("stat_recent")}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.recentStudents || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t("filter_title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t("search_placeholder")}
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Sort By */}
              <Select
                value={sortBy}
                onValueChange={(
                  value: "name" | "enrollmentDate" | "progress"
                ) => {
                  setSortBy(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("sort_by")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">{t("sort_name")}</SelectItem>
                  <SelectItem value="enrollmentDate">
                    {t("sort_date")}
                  </SelectItem>
                  <SelectItem value="progress">{t("sort_progress")}</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Order */}
              <Select
                value={sortOrder}
                onValueChange={(value: "asc" | "desc") => {
                  setSortOrder(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder={t("sort_order")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">{t("order_asc")}</SelectItem>
                  <SelectItem value="desc">{t("order_desc")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("table_title")}</CardTitle>
            <CardDescription className="lowercase">
              {(pagination?.totalStudents || 0) !== 1
                ? pagination?.totalStudents || 0
                : ""}{" "}
              {t("table_description")}
              {isFetching && (
                <span className="ml-2 text-blue-600">{t("refresh")}</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">{t("loading")}</span>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? t("empty_title_search") : t("empty_title")}
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? t("empty_desc_search") : t("empty_desc")}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("column_student")}</TableHead>
                        <TableHead>{t("column_email")}</TableHead>
                        <TableHead>{t("column_courses")}</TableHead>
                        <TableHead>{t("column_progress")}</TableHead>
                        <TableHead>{t("column_enrolled")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student, idx) => {
                        return (
                          <TableRow
                            key={idx}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() =>
                              router.push(
                                `/teacher/students/${student.studentId}`
                              )
                            }
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={student.image}
                                    alt={student.name}
                                  />
                                  <AvatarFallback>
                                    {getInitials(student.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {student.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    ID: {student.studentId.slice(-8)}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{student.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {student.enrolledCourses.map(
                                  (course, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {course}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-full bg-gray-200 rounded-full h-2 max-w-[80px]">
                                  <div
                                    className={`h-2 rounded-full ${getProgressColor(
                                      student.progressPercentage
                                    )}`}
                                    style={{
                                      width: `${student.progressPercentage}%`,
                                    }}
                                  ></div>
                                </div>
                                <Badge
                                  variant={getProgressBadgeVariant(
                                    student.progressPercentage
                                  )}
                                >
                                  {student.progressPercentage}%
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {formatDistanceToNow(
                                  new Date(student.enrollmentDate),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-700">
                      Menampilkan {(currentPage - 1) * studentsPerPage + 1}{" "}
                      sampai{" "}
                      {Math.min(
                        currentPage * studentsPerPage,
                        pagination.totalStudents
                      )}{" "}
                      dari {pagination.totalStudents} siswa
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={!pagination.hasPreviousPage || isFetching}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        {t("pagination_prev")}
                      </Button>

                      <div className="flex items-center gap-1">
                        {[...Array(pagination.totalPages)].map((_, index) => {
                          const page = index + 1;
                          const isCurrentPage = page === currentPage;
                          const isNearCurrentPage =
                            Math.abs(page - currentPage) <= 2;
                          const isFirstOrLast =
                            page === 1 || page === pagination.totalPages;

                          if (isNearCurrentPage || isFirstOrLast) {
                            return (
                              <Button
                                key={page}
                                variant={isCurrentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                disabled={isFetching}
                                className="min-w-[40px]"
                              >
                                {page}
                              </Button>
                            );
                          } else if (
                            page === currentPage - 3 ||
                            page === currentPage + 3
                          ) {
                            return (
                              <span key={page} className="px-2">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={!pagination.hasNextPage || isFetching}
                      >
                        {t("pagination_next")}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TeacherStudents;

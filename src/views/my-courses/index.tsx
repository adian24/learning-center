"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CourseCard from "@/sections/dashboard/CourseCard";
import { useStudentCourses } from "@/hooks/use-student-dashboard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Grid,
  List,
  Search,
  X,
  BookOpen,
  Clock,
  CheckCircle,
  SortAsc,
  SortDesc,
  Calendar,
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const MyCourses = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeStatus, setActiveStatus] = useState<
    "all" | "inProgress" | "completed"
  >("all");
  const [sortBy, setSortBy] = useState<"updated" | "title" | "progress">(
    "updated"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch enrolled courses
  const { data: courses, isLoading } = useStudentCourses();

  // Filter courses based on search query and status
  const filteredCourses = courses?.filter((course) => {
    // Filter by search query
    const matchesSearch =
      !searchQuery ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by status
    const matchesStatus =
      activeStatus === "all" ||
      (activeStatus === "completed" && course.progress === 100) ||
      (activeStatus === "inProgress" && course.progress < 100);

    return matchesSearch && matchesStatus;
  });

  // Sort courses
  const sortedCourses = filteredCourses?.sort((a, b) => {
    if (sortBy === "title") {
      return sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else if (sortBy === "progress") {
      return sortOrder === "asc"
        ? a.progress - b.progress
        : b.progress - a.progress;
    } else {
      // updated
      return sortOrder === "asc"
        ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  // Clear search query
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Navigate to course
  const handleNavigateToCourse = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  console.log("Courses:", courses);

  return (
    <Layout>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">My Courses</h1>
            <p className="text-muted-foreground">
              Track and continue your learning journey
            </p>
          </div>

          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search your courses..."
                  className="pl-10 pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as any)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">Last Updated</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleSortOrder}
                  title={sortOrder === "asc" ? "Ascending" : "Descending"}
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="bg-gray-100 rounded-lg p-1 flex">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="flex items-center"
                >
                  <Grid className="h-4 w-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="flex items-center"
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>
            </div>
          </div>

          {/* Status tabs */}
          <Tabs
            defaultValue="all"
            className="mb-6"
            onValueChange={(value) => setActiveStatus(value as any)}
          >
            <TabsList>
              <TabsTrigger value="all">All Courses</TabsTrigger>
              <TabsTrigger value="inProgress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Course stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Courses</p>
                  <h3 className="text-xl font-semibold">
                    {isLoading ? (
                      <Skeleton className="h-7 w-12 inline-block" />
                    ) : (
                      courses?.length || 0
                    )}
                  </h3>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-4">
                <div className="bg-amber-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">In Progress</p>
                  <h3 className="text-xl font-semibold">
                    {isLoading ? (
                      <Skeleton className="h-7 w-12 inline-block" />
                    ) : (
                      courses?.filter((c) => c.progress > 0 && c.progress < 100)
                        .length || 0
                    )}
                  </h3>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <h3 className="text-xl font-semibold">
                    {isLoading ? (
                      <Skeleton className="h-7 w-12 inline-block" />
                    ) : (
                      courses?.filter((c) => c.progress === 100).length || 0
                    )}
                  </h3>
                </div>
              </div>
            </Card>
          </div>

          {/* Courses display */}
          {isLoading ? (
            // Loading skeleton
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-32 w-full" />
                      <div className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-2 w-full mt-3" />
                      </div>
                    </Card>
                  ))}
              </div>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Course</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="text-center">Chapters</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array(6)
                      .fill(0)
                      .map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-6 w-48" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                          <TableCell className="text-center">
                            <Skeleton className="h-5 w-12 mx-auto" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-24" />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Card>
            )
          ) : sortedCourses && sortedCourses.length > 0 ? (
            // Courses display based on view mode
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    imageUrl={course.imageUrl}
                    category={course.category}
                    progress={course.progress}
                    chaptersCount={course.chaptersCount}
                    completedChapters={course.completedChapters}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Course</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead className="text-center">Chapters</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedCourses.map((course) => (
                      <TableRow
                        key={course.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleNavigateToCourse(course.id)}
                      >
                        <TableCell>
                          <div className="font-medium">{course.title}</div>
                        </TableCell>
                        <TableCell>
                          {course.category ? (
                            <Badge variant="outline">{course.category}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Uncategorized
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress value={course.progress} className="h-2" />
                            <span className="text-xs w-9">
                              {course.progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            <span>
                              {course.completedChapters}/{course.chaptersCount}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              {format(
                                new Date(course.updatedAt),
                                "MMM d, yyyy"
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {course.progress === 100 ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              Completed
                            </Badge>
                          ) : course.progress > 0 ? (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                              In Progress
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                              Not Started
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )
          ) : (
            // Empty state
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center max-w-md mx-auto">
                <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery
                    ? "No courses match your search criteria."
                    : activeStatus !== "all"
                    ? activeStatus === "completed"
                      ? "You haven't completed any courses yet."
                      : "You don't have any courses in progress."
                    : "You haven't enrolled in any courses yet."}
                </p>
                {searchQuery || activeStatus !== "all" ? (
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveStatus("all");
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button onClick={() => router.push("/courses")}>
                    Browse Courses
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyCourses;

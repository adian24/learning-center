"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Layout from "@/layout";
import { Course } from "@/lib/types";
import CourseCard from "@/sections/course/CourseCard";
import CourseList from "@/sections/course/CourseList";
import TeacherEmptyCourse from "@/sections/teacher/TeacherEmptyCourse";
import {
  BookOpen,
  FileText,
  LayoutGrid,
  List,
  MoreVertical,
  Plus,
  Search,
  Users,
  UsersRound,
} from "lucide-react";
import { useState } from "react";

export default function TeacherCourses() {
  const [viewType, setViewType] = useState("grid");

  const courses: Course[] = [
    {
      id: 1,
      title: "Web Development Fundamentals",
      description:
        "Learn the basics of web development including HTML, CSS, and JavaScript",
      imageUrl: "/api/placeholder/400/250",
      enrolledCount: 45,
      totalChapters: 12,
      price: 49.99,
      isPublished: true,
      level: "BEGINNER",
      lastUpdated: "12-05-2024",
    },
    {
      id: 2,
      title: "Advanced React Patterns",
      description: "Master advanced React concepts and design patterns",
      imageUrl: "/api/placeholder/400/250",
      enrolledCount: 32,
      totalChapters: 8,
      price: 79.99,
      isPublished: false,
      level: "ADVANCED",
      lastUpdated: "12-05-2024",
    },
    {
      id: 3,
      title: "Jumping Jacks 1000X",
      description: "Master advanced React concepts and design patterns",
      imageUrl: "/api/placeholder/400/250",
      enrolledCount: 32,
      totalChapters: 8,
      price: 79.99,
      isPublished: false,
      level: "INTERMEDIATE",
      lastUpdated: "12-05-2024",
    },
  ];
  return (
    <Layout>
      {/* Top Navigation */}
      <div className="bg-white shadow-sm">
        <div className="flex justify-between items-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-16">
            <h1 className="text-lg font-bold sm:text-xl md:text-2xl">
              Courses
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Kelola dan buat kursus Anda
            </p>
          </div>

          {courses.length > 0 && (
            <Button
              size="lg"
              className="text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Buat Course Baru
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Empty State Card */}
        {courses.length === 0 && <TeacherEmptyCourse />}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input placeholder="Cari course..." className="pl-9" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Level</SelectItem>
              <SelectItem value="BEGINNER">Beginner</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
              <SelectItem value="ADVANCED">Advanced</SelectItem>
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

        {/* Course Content */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {viewType === "grid" &&
            courses.map((course) => (
              <CourseCard course={course} key={course.id} />
            ))}
        </div>
        {viewType === "list" && <CourseList courses={courses} />}
      </div>
    </Layout>
  );
}

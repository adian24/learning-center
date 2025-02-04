"use client";

import { Button } from "@/components/ui/button";
import Layout from "@/layout";
import { Course } from "@/lib/types";
import CourseCard from "@/sections/course/CourseCard";
import CourseFilter from "@/sections/course/CourseFilter";
import CourseList from "@/sections/course/CourseList";
import TeacherEmptyCourse from "@/sections/teacher/TeacherEmptyCourse";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TeacherCourses() {
  const router = useRouter();

  const [viewType, setViewType] = useState<"grid" | "list">("grid");

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
              onClick={() => router.push("/teacher/courses/create")}
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
        <CourseFilter viewType={viewType} setViewType={setViewType} />

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

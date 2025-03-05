"use client";

import SimpleLayout from "@/layout/SimpleLayout.tsx";
import CardEnrollment from "@/sections/courses/detail/CardEnrollment";
import ContentTabs from "@/sections/courses/detail/ContentTabs";
import CourseHeader from "@/sections/courses/detail/CourseHeader";
import CourseSylabus from "@/sections/courses/detail/CourseSylabus";
import InstructorSection from "@/sections/courses/detail/InstructorSection";
import ReviewsSection from "@/sections/courses/detail/ReviewsSection";
import SimilarCourse from "@/sections/courses/detail/SimilarCourse";
import { useParams } from "next/navigation";
import React from "react";

const courseMock = {
  id: "1",
  title: "HACCP Food Safety System for Restaurants and Other Catering Services",
  description:
    "In this food safety course, learn how to implement the HACCP Food Safety System in your catering business.",
  imageUrl: "/api/placeholder/600/400",
  price: 49.99,
  isPublished: true,
  teacherId: "1",
  teacher: {
    id: "1",
    user: {
      id: "1",
      name: "Dr. Khalifa Reda",
      image: "/api/placeholder/80/80",
    },
    bio: "Senior Instructor and Associate Professor at the Food Technology Research Institute (FTRI) at the Agricultural Research Center",
    expertise: ["Food Safety", "HACCP", "Restaurant Management"],
  },
  category: {
    id: "1",
    name: "Food Safety",
    slug: "food-safety",
  },
  level: "INTERMEDIATE",
  duration: 180,
  totalSteps: 5,
  rating: 4.7,
  reviewCount: 142,
  enrolledStudents: 2349,
  language: "English",
  createdAt: "2024-05-15T10:00:00Z",
  chapters: [
    {
      id: "1",
      title: "The Catering Industry and Food Safety",
      description:
        "This module discusses the catering industry, its sectors, and practices. We also explore different food safety hazards that may pose risks to the consumers.",
      position: 1,
      isPublished: true,
      isFree: true,
      duration: 30,
    },
    {
      id: "2",
      title: "HACCP Food Safety System and Prerequisite Programs",
      description:
        "In this module, you will be introduced to the HACCP food safety system. It's history and benefits. Learn the concept of prerequisite programs and their role in the HACCP implementation.",
      position: 2,
      isPublished: true,
      isFree: false,
      duration: 45,
    },
    {
      id: "3",
      title: "Preliminary Steps",
      description:
        "One of the most important steps before you implement the principles of HACCP is to plan your ground. Let's see the preliminary steps.",
      position: 3,
      isPublished: true,
      isFree: false,
      duration: 35,
    },
    {
      id: "4",
      title: "The Seven Principles of HACCP",
      description:
        "In this module, you will learn about the seven principles of HACCP that need to be applied when implementing a food safety system in a catering business.",
      position: 4,
      isPublished: true,
      isFree: false,
      duration: 40,
    },
    {
      id: "5",
      title: "Course assessment",
      description:
        "Final assessment to test your understanding of HACCP principles.",
      position: 5,
      isPublished: true,
      isFree: false,
      duration: 30,
    },
  ],
  whatYouWillLearn: [
    "Define the catering industry and sectors",
    "Explain the key HACCP principles",
    "Define HACCP food safety system and implementation steps",
    "Create a HACCP plan for your catering business",
  ],
};

// Mock reviews
const reviews = [
  {
    id: "1",
    user: { name: "Muhammad Asim Khalifa", image: "/api/placeholder/50/50" },
    rating: 5,
    comment: "Very nice helpful subject",
    date: "2 weeks ago",
  },
  {
    id: "2",
    user: { name: "James H.", image: "/api/placeholder/50/50" },
    rating: 4,
    comment: "Nice course!",
    date: "Last month",
  },
];

// Mock similar courses
const similarCourses = [
  {
    id: "2",
    title:
      "Food Safety: Good Manufacturing Practices (GMP) in the Food Industry",
    imageUrl: "/api/placeholder/300/200",
    price: 39.99,
    rating: 4.5,
    reviewCount: 73,
    level: "BEGINNER",
  },
  {
    id: "3",
    title:
      "HACCP Food Safety System for Restaurants and Other Catering Services",
    imageUrl: "/api/placeholder/300/200",
    price: 49.99,
    rating: 4.7,
    reviewCount: 142,
    level: "INTERMEDIATE",
  },
  {
    id: "4",
    title: "Food Safety Systems for Professionals",
    imageUrl: "/api/placeholder/300/200",
    price: 59.99,
    rating: 4.9,
    reviewCount: 89,
    level: "ADVANCED",
  },
];

const CourseDetailPage = () => {
  const params = useParams();
  const courseId = params.coursesId as string;

  return (
    <SimpleLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CourseHeader courseId={courseId} />
            {/* <CourseSylabus courseId={courseId} /> */}
            <ContentTabs courseMock={courseMock} courseId={courseId} />
            <InstructorSection courseMock={courseMock} courseId={courseId} />
            <ReviewsSection reviews={reviews} courseId={courseId} />
            <SimilarCourse
              similarCourses={similarCourses}
              courseId={courseId}
            />
          </div>

          {/* Sidebar - fixed width and sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <CardEnrollment courseId={courseId} />
            </div>
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
};

export default CourseDetailPage;

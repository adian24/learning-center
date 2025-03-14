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

const CourseDetailPage = () => {
  const params = useParams();
  const courseId = params.coursesId as string;

  return (
    <SimpleLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CourseHeader courseId={courseId} />
            <CourseSylabus courseId={courseId} />
            <ContentTabs courseId={courseId} />
            <InstructorSection courseId={courseId} />
            <ReviewsSection courseId={courseId} />
            <SimilarCourse courseId={courseId} />
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

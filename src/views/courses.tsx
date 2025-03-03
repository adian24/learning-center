import { Skeleton } from "@/components/ui/skeleton";
import Layout from "@/layout";
import CoursesClient from "@/sections/courses/CourseClient";
import { Suspense } from "react";

const CoursesLoading = () => (
  <div className="space-y-4">
    <div className="container py-8">
      <div className="mb-8">
        <Skeleton className="h-10 w-1/3 mb-2" />
        <Skeleton className="h-5 w-2/3" />
      </div>
      <Skeleton className="h-12 w-full mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Courses = () => {
  return (
    <Layout>
      <Suspense fallback={<CoursesLoading />}>
        <CoursesClient />
      </Suspense>
    </Layout>
  );
};

export default Courses;

import { Skeleton } from "@/components/ui/skeleton";
import SimpleLayout from "@/layout/SimpleLayout.tsx";
import CoursesClient from "@/sections/courses/CourseClient";
import { Suspense } from "react";

const Courses = () => {
  return (
    <SimpleLayout>
      <Suspense>
        <CoursesClient />
      </Suspense>
    </SimpleLayout>
  );
};

export default Courses;

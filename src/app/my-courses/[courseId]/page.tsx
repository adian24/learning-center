import { Suspense } from "react";
import MyCoursePlayerPage from "@/views/my-course/player";

export default function MyCoursePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyCoursePlayerPage />
    </Suspense>
  );
}

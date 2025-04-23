import { Suspense } from "react";
import ThreeDsRedirect from "@/sections/courses/payment/3dsRedirect";

export default function ThreeDSRedirectPage() {
  // Render appropriate UI based on status
  return (
    <Suspense>
      <ThreeDsRedirect />
    </Suspense>
  );
}

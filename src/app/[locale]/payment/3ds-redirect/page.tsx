import { Suspense } from "react";
import ThreeDsRedirect from "@/sections/courses/payment/3dsRedirect";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memproses Pembayaran | E-Learning",
  description: "Sedang memproses otentikasi 3DS untuk pembayaran Anda",
  keywords: ["3ds", "pembayaran", "redirect", "e-learning"],
};

export default function ThreeDSRedirectPage() {
  // Render appropriate UI based on status
  return (
    <Suspense>
      <ThreeDsRedirect />
    </Suspense>
  );
}

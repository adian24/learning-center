import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const ThreeDsRedirect = () => {
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>(
    "Memverifikasi pembayaran Anda..."
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get transaction details from URL parameters
  useEffect(() => {
    const orderIdParam = searchParams.get("order_id");
    const transactionStatusParam = searchParams.get("transaction_status");
    const statusCodeParam = searchParams.get("status_code");
    const courseIdParam = searchParams.get("course_id");

    // If no parameters, probably direct access to page
    if (!orderIdParam) {
      setStatus("failed");
      setMessage("Pengalihan tidak valid. Detail transaksi tidak ada.");
      return;
    }

    // Store course ID for redirection
    if (courseIdParam) {
      setCourseId(courseIdParam);
    }

    // Check payment status from parameters
    const checkPaymentStatus = async () => {
      try {
        // Call your API to check/update payment status
        const response = await fetch("/api/payment/credit-card/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: orderIdParam,
            transaction_status: transactionStatusParam,
            status_code: statusCodeParam,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to verify payment");
        }

        const data = await response.json();

        // Store enrollment ID for redirect
        if (data.enrollmentId) {
          setEnrollmentId(data.enrollmentId);
        }

        // Set status based on response
        if (data.status === "COMPLETED") {
          setStatus("success");
          setMessage("Pembayaran berhasil!");
        } else if (data.status === "PENDING") {
          setStatus("loading");
          setMessage("Pembayaran Anda masih diproses...");
        } else {
          setStatus("failed");
          setMessage(data.message || "Verifikasi pembayaran gagal.");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setStatus("failed");
        setMessage("Tidak dapat memverifikasi status pembayaran.");
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  // Automatic redirect after success/failure
  useEffect(() => {
    if (status === "success") {
      toast.success("Pembayaran berhasil!");

      // Set timeout for redirect to give user time to see success message
      const redirectTimer = setTimeout(() => {
        if (courseId && enrollmentId) {
          router.push(
            `/courses/${courseId}/success?enrollment=${enrollmentId}`
          );
        } else if (enrollmentId) {
          router.push(`/dashboard/courses`);
        } else {
          router.push(`/dashboard`);
        }
      }, 3000);

      // Clean up the timeout if component unmounts
      return () => clearTimeout(redirectTimer);
    }
  }, [status, courseId, enrollmentId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {status === "loading" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold">{message}</h1>
            <p className="text-muted-foreground">
              Harap tunggu sementara kami memproses pembayaran Anda. Ini mungkin
              membutuhkan beberapa saat.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-green-700">{message}</h1>
            <p className="text-muted-foreground">
              Pembayaran Anda telah berhasil diproses. Anda akan segera
              dialihkan.
            </p>
            <Button
              onClick={() => {
                if (courseId && enrollmentId) {
                  router.push(
                    `/courses/${courseId}/success?enrollment=${enrollmentId}`
                  );
                } else {
                  router.push(`/dashboard/courses`);
                }
              }}
            >
              Lanjutkan ke Kursus
            </Button>
          </div>
        )}

        {status === "failed" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-red-100 p-4 rounded-full">
                <XCircle className="h-16 w-16 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-red-700">
              Pembayaran Gagal
            </h1>
            <p className="text-muted-foreground">{message}</p>
            <div className="space-y-2">
              <Button
                onClick={() => {
                  if (courseId) {
                    router.push(`/courses/${courseId}/payment/credit-card`);
                  } else {
                    router.push(`/courses`);
                  }
                }}
                className="w-full"
              >
                Coba Lagi
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="w-full"
              >
                Ke Dasbor
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreeDsRedirect;

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useEnrollmentPaymentStatus } from "@/hooks/use-enrolled-courses";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/payments/CountdownTimer";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface PaymentStatusCheckerProps {
  enrollmentId: string;
  courseId: string;
  onStatusChange?: (status: string) => void;
  redirectOnComplete?: boolean;
  className?: string;
}

/**
 * Component that checks payment status and shows appropriate UI
 * Can be embedded in various payment flow pages
 */
export function PaymentStatusChecker({
  enrollmentId,
  courseId,
  onStatusChange,
  redirectOnComplete = true,
  className = "",
}: PaymentStatusCheckerProps) {
  const router = useRouter();
  const [checkCount, setCheckCount] = useState(0);
  const [manualChecking, setManualChecking] = useState(false);

  // Calculate expiry time - 24 hours from now as fallback
  const fallbackExpiryTime = new Date();
  fallbackExpiryTime.setHours(fallbackExpiryTime.getHours() + 24);

  // Use payment status hook with automatic polling
  const { data, isLoading, error, refetch } = useEnrollmentPaymentStatus(
    enrollmentId,
    true,
    15000 // Check every 15 seconds
  );

  // Handle manual check
  const handleManualCheck = async () => {
    setManualChecking(true);
    try {
      await refetch();
      setCheckCount((prev) => prev + 1);
    } finally {
      setManualChecking(false);
    }
  };

  // Notify parent component of status changes
  useEffect(() => {
    if (data?.status && onStatusChange) {
      onStatusChange(data.status);
    }
  }, [data?.status, onStatusChange]);

  // Redirect on complete if flag is set
  useEffect(() => {
    if (data?.status === "COMPLETED" && redirectOnComplete) {
      toast.success("Pembayaran berhasil! Mengarahkan ke kursus...");
      // Small delay to show the success state
      const timeout = setTimeout(() => {
        router.push(`/courses/${courseId}`);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [data?.status, redirectOnComplete, router, courseId]);

  // Handle expiry
  const handleExpiry = () => {
    toast.error("Sesi pembayaran telah kedaluwarsa");
    router.push(`/courses/${courseId}/checkout`);
  };

  // Render appropriate UI based on status
  if (isLoading && checkCount === 0) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        <span>Memeriksa status pembayaran...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex flex-col items-center p-4 text-center ${className}`}
      >
        <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
        <h3 className="font-medium mb-1">Error saat memeriksa pembayaran</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Kami tidak dapat memeriksa status pembayaran Anda. Silakan coba lagi.
        </p>
        <Button onClick={handleManualCheck} disabled={manualChecking}>
          {manualChecking ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Memeriksa...
            </>
          ) : (
            "Coba Lagi"
          )}
        </Button>
      </div>
    );
  }

  // Status is COMPLETED
  if (data?.status === "COMPLETED") {
    return (
      <div
        className={`flex flex-col items-center p-4 text-center ${className}`}
      >
        <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
        <h3 className="font-medium mb-1">Pembayaran Berhasil!</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Pembayaran Anda telah berhasil diselesaikan.
        </p>
        {redirectOnComplete ? (
          <p className="text-sm">Mengarahkan ke kursus Anda...</p>
        ) : (
          <Button onClick={() => router.push(`/courses/${courseId}`)}>
            Ke Kursus
          </Button>
        )}
      </div>
    );
  }

  // Status is FAILED
  if (data?.status === "FAILED") {
    return (
      <div
        className={`flex flex-col items-center p-4 text-center ${className}`}
      >
        <XCircle className="h-8 w-8 text-red-500 mb-2" />
        <h3 className="font-medium mb-1">Pembayaran Gagal</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Pembayaran Anda tidak berhasil. Silakan coba lagi.
        </p>
        <Button onClick={() => router.push(`/courses/${courseId}/checkout`)}>
          Coba Lagi
        </Button>
      </div>
    );
  }

  // Status is PENDING (default)
  return (
    <div className={`flex flex-col items-center p-4 text-center ${className}`}>
      <div className="animate-pulse bg-amber-100 p-3 rounded-full mb-3">
        <Loader2 className="h-6 w-6 text-amber-600 animate-spin" />
      </div>
      <h3 className="font-medium mb-1">Pembayaran Tertunda</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Kami sedang menunggu konfirmasi pembayaran Anda.
      </p>

      <div className="flex items-center justify-center mb-4">
        <CountdownTimer
          expiryTime={data?.expiryTime || fallbackExpiryTime}
          onExpire={handleExpiry}
          className="text-amber-600 font-medium"
          labelText="Waktu tersisa:"
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleManualCheck}
          variant="outline"
          disabled={manualChecking}
        >
          {manualChecking ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Memeriksa...
            </>
          ) : (
            "Periksa Status"
          )}
        </Button>
        <Button onClick={() => router.push(`/courses/${courseId}/checkout`)}>
          Mulai Ulang Pembayaran
        </Button>
      </div>
    </div>
  );
}

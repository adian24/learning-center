"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Define props with TypeScript
interface PaymentButtonProps {
  courseId: string | undefined;
  price: number;
  label?: string;
  className?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: any) => void;
    };
  }
}

export default function PaymentButton({
  courseId,
  price,
  label = "Enroll Now",
  className = "",
  disabled = false,
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Call our API to get Midtrans token
      const response = await fetch("/api/midtrans-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          amount: price,
          currency: "IDR",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to initiate payment");
      }

      const data = await response.json();

      // Make sure Snap is loaded
      if (!window.snap) {
        // Load Midtrans Snap JS SDK if not already loaded
        const script = document.createElement("script");
        script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
        script.setAttribute(
          "data-client-key",
          process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""
        );
        document.head.appendChild(script);

        // Wait for script to load
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Open Midtrans Snap payment popup
      window.snap?.pay(data.token, {
        onSuccess: function () {
          toast.success("Payment successful!");
          // Update enrollment status via webhook or redirect to success page
          //   router.push(
          //     `/courses/${courseId}/success?enrollment=${data.enrollmentId}`
          //   );
          router.refresh();
          setLoading(false);
        },
        onPending: function () {
          toast.info("Payment is pending, please complete your payment");
        },
        onError: function () {
          toast.error("Payment failed, please try again later");
        },
        onClose: function () {
          toast.info("Payment canceled");
          setLoading(false);
        },
      });
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "Payment failed");
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? "Processing..." : label}
    </Button>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { formatPrice } from "@/utils/formatPrice";
import { CourseImageCard } from "@/components/media/SecureImage";

interface SnapCheckoutProps {
  courseId: string;
  courseTitle: string;
  courseImageUrl?: string;
  price: number;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

export function SnapCheckout({
  courseId,
  courseTitle,
  courseImageUrl,
  price,
  userName,
  userEmail,
  userPhone,
}: SnapCheckoutProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);

  // Load Midtrans Snap script
  useEffect(() => {
    const snapScript = document.createElement("script");
    snapScript.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    snapScript.type = "text/javascript";
    snapScript.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""
    );
    snapScript.onload = () => {
      setIsScriptLoaded(true);
    };
    document.body.appendChild(snapScript);

    return () => {
      document.body.removeChild(snapScript);
    };
  }, []);

  const handlePayment = async () => {
    if (!isScriptLoaded) {
      toast.error(
        "Payment system is still loading. Please try again in a moment."
      );
      return;
    }

    setIsLoading(true);

    try {
      // Call our API to get a Snap token
      const response = await fetch("/api/payment/snap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          amount: price,
          customerName: userName,
          customerEmail: userEmail,
          customerPhone: userPhone,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to initialize payment");
      }

      const data = await response.json();

      // Open Snap popup
      // @ts-ignore - window.snap is injected by the Midtrans script
      window.snap.pay(data.snapToken, {
        onSuccess: function () {
          router.push(
            `/courses/${courseId}/success?enrollment=${data.enrollmentId}`
          );
        },
        onPending: function () {
          router.push(
            `/courses/${courseId}/payment?method=pending&enrollment=${data.enrollmentId}`
          );
        },
        onError: function (error: any) {
          console.error("Payment error:", error);
          toast.error("Payment failed. Please try again.");
          setIsLoading(false);
        },
        onClose: function () {
          toast.info("Payment canceled. You can try again anytime.");
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to initialize payment"
      );
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Purchase</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Course details */}
          <div className="flex items-center gap-4">
            {courseImageUrl && (
              <div className="relative w-20 h-20 rounded overflow-hidden">
                <CourseImageCard
                  imageKey={courseImageUrl}
                  courseId={courseId}
                  courseTitle={courseTitle}
                  className="w-full h-full"
                />
              </div>
            )}
            <div>
              <h3 className="font-medium">{courseTitle}</h3>
              <p className="text-lg font-bold">{formatPrice(price)}</p>
            </div>
          </div>

          {/* Payment button */}
          <Button
            onClick={handlePayment}
            disabled={isLoading || !isScriptLoaded}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Pay Now"
            )}
          </Button>

          {/* Security info */}
          <div className="text-center text-xs text-muted-foreground mt-4">
            <p>Secure payment processed by Midtrans</p>
            <p className="mt-1">
              By clicking &quot;Pay Now&quot;, you agree to our Terms and
              Conditions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseImageCard } from "@/components/media/SecureImage";
import { formatPrice } from "@/utils/formatPrice";
import {
  Clock,
  User,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

interface PendingPaymentCardProps {
  enrollment: {
    id: string;
    amount: number;
    currency: string;
    courseId: string;
    course: {
      id: string;
      title: string;
      imageUrl?: string;
      teacher: {
        user: {
          name?: string;
        };
      };
    };
  };
}

export default function PendingPaymentCard({
  enrollment,
}: PendingPaymentCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState<boolean>(false);

  +(
    // Load Midtrans Snap script
    useEffect(() => {
      const snapScript = document.createElement("script");
      snapScript.src = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "";
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
        if (document.body.contains(snapScript)) {
          document.body.removeChild(snapScript);
        }
      };
    }, [])
  );

  const handleContinuePayment = async () => {
    if (!isScriptLoaded) {
      toast.error(
        "Payment system is still loading. Please try again in a moment."
      );
      return;
    }

    setIsLoading(true);

    try {
      // Call our API to get a new Snap token for the existing enrollment
      const response = await fetch("/api/payment/snap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: enrollment.courseId,
          amount: enrollment.amount,
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
          // On success, redirect to course page (not success page)
          router.push(`/courses/${enrollment.courseId}`);
        },
        onPending: function () {
          // Stay on pending page if payment is still pending
          router.push(
            `/courses/${enrollment.courseId}/payment?method=pending&enrollment=${enrollment.id}`
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Pending
        </h1>
        <p className="text-gray-600">
          Your enrollment is waiting for payment completion
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Course Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Course Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Course Image */}
              <div className="flex-shrink-0">
                <div className="w-full h-40 rounded-lg overflow-hidden">
                  <CourseImageCard
                    imageKey={enrollment.course.imageUrl}
                    courseId={enrollment.course.id}
                    courseTitle={enrollment.course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Course Info */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                  {enrollment.course.title}
                </h3>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>
                    {enrollment.course.teacher.user.name || "Instructor"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>Course ID: {enrollment.course.id}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Course Price</span>
                <span className="font-medium">
                  {formatPrice(enrollment.amount)}
                </span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-xl font-black text-blue-600">
                    {formatPrice(enrollment.amount)}
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">
                      Payment Required
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Complete your payment to access the course content and
                      start learning immediately.
                    </p>
                    {!isScriptLoaded && (
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Initializing payment system...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => {
                  router.back();
                }}
                className="w-full"
              >
                <ArrowLeft className="w-5 h-5 ml-2" />
                Kembali
              </Button>
              <Button
                onClick={handleContinuePayment}
                disabled={isLoading || !isScriptLoaded}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : !isScriptLoaded ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Continue Payment
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need help?{" "}
            <Link href="/support" className="text-blue-600 hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

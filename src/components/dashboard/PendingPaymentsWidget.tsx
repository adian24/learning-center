"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEnrolledCourses } from "@/hooks/use-enrolled-courses";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/utils/formatPrice";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { CourseImageCard } from "@/components/media/SecureImage";

import {
  Loader2,
  CreditCard,
  AlertCircle,
  Clock,
  ChevronRight,
} from "lucide-react";

/**
 * Widget that displays pending payments on the dashboard
 * Shows a list of courses that require payment and actions to take
 */
export function PendingPaymentsWidget() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch only PENDING enrollments
  const {
    data: pendingEnrollments,
    isLoading,
    error,
  } = useEnrolledCourses("PENDING");

  // Handle continue payment
  const handleContinuePayment = (enrollmentId: string, courseId: string) => {
    router.push(
      `/courses/${courseId}/payment?method=pending&enrollment=${enrollmentId}`
    );
  };

  // If no pending payments and not loading, return null
  if (!isLoading && (!pendingEnrollments || pendingEnrollments.length === 0)) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Pending Payments</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Pending Payments</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
          <p className="text-sm text-muted-foreground">
            Error loading pending payments
          </p>
        </CardContent>
      </Card>
    );
  }

  // Determine how many items to show
  const safeEnrollments = pendingEnrollments ?? [];
  const itemsToShow = isExpanded
    ? safeEnrollments.length
    : Math.min(2, safeEnrollments.length);
  const displayedEnrollments = safeEnrollments.slice(0, itemsToShow);
  const hasMore = safeEnrollments.length > 2 && !isExpanded;

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          <span>Pending Payments</span>
          <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-full ml-2">
            {safeEnrollments.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4">
          You have {safeEnrollments.length} course
          {safeEnrollments.length !== 1 ? "s" : ""} with pending payments.
          Complete the payments to gain access.
        </p>

        <div className="space-y-3">
          {displayedEnrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-white"
            >
              {/* Course thumbnail */}
              <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                <CourseImageCard
                  imageKey={enrollment.course.imageUrl}
                  courseId={enrollment.course.id}
                  courseTitle={enrollment.course.title}
                  className="w-full h-full"
                />
              </div>

              {/* Course info */}
              <div className="flex-grow min-w-0">
                <h4 className="font-medium text-sm line-clamp-1">
                  {enrollment.course.title}
                </h4>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>{formatPrice(enrollment.amount)}</span>
                </div>
              </div>

              {/* Action button */}
              <Button
                size="sm"
                className="flex-shrink-0"
                onClick={() =>
                  handleContinuePayment(enrollment.id, enrollment.courseId)
                }
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay
              </Button>
            </div>
          ))}
        </div>

        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-center"
            onClick={() => setIsExpanded(true)}
          >
            Show All ({safeEnrollments.length})
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push("/my-courses?tab=pending")}
        >
          View All Pending Payments
        </Button>
      </CardFooter>
    </Card>
  );
}

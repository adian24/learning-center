"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseImageCard } from "@/components/media/SecureImage";
import { formatPrice } from "@/utils/formatPrice";
import { XCircle, User, BookOpen, ArrowRight, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface ExpiredPaymentCardProps {
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

export default function ExpiredPaymentCard({ enrollment }: ExpiredPaymentCardProps) {
  const router = useRouter();

  const handleCreateNewPayment = () => {
    router.push(`/courses/${enrollment.courseId}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Expired</h1>
        <p className="text-gray-600">Your payment session has expired. Please create a new payment to continue.</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Course Image */}
            <div className="flex-shrink-0">
              <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden">
                <CourseImageCard
                  imageKey={enrollment.course.imageUrl}
                  courseId={enrollment.course.id}
                  courseTitle={enrollment.course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Course Info */}
            <div className="flex-1 space-y-3">
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                {enrollment.course.title}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{enrollment.course.teacher.user.name || "Instructor"}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen className="w-4 h-4" />
                <span>Course ID: {enrollment.course.id}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Course Price</span>
              <span className="font-medium">{formatPrice(enrollment.amount)}</span>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-red-600">
                  {formatPrice(enrollment.amount)}
                </span>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Payment Session Expired</p>
                  <p className="text-sm text-red-700 mt-1">
                    Your previous payment session has expired. Please create a new payment to access the course content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Button
          onClick={handleCreateNewPayment}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-medium"
          size="lg"
        >
          Create New Payment
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need help? <a href="/support" className="text-red-600 hover:underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
"use client";

import Image from "next/image";
import { SnapCheckout } from "@/components/payments/SnapCheckout";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/utils/formatPrice";
import { CheckCircle } from "lucide-react";

interface SnapCheckoutPageProps {
  course: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    price: number;
  };
  user: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export default function SnapCheckoutPage({
  course,
  user,
}: SnapCheckoutPageProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
      <div>
        <SnapCheckout
          courseId={course.id}
          courseTitle={course.title}
          courseImageUrl={course.imageUrl}
          price={course.price}
          userName={user.name}
          userEmail={user.email}
          userPhone={user.phone}
        />
      </div>

      <div>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="mb-4">
              <div className="relative aspect-video overflow-hidden rounded mb-4">
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-medium">{course.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {course.description}
              </p>
            </div>

            <div className="mt-6 space-y-4 pt-4 border-t">
              <div className="flex justify-between">
                <span>Course Price</span>
                <span>{formatPrice(course.price)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(course.price)}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium mb-2">What You&apos;ll Get</h4>
              <ul className="space-y-2">
                <li className="flex gap-2 items-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Lifetime Access</span>
                </li>
                <li className="flex gap-2 items-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Access on Mobile & Desktop</span>
                </li>
                <li className="flex gap-2 items-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Certificate of Completion</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCourse } from "@/hooks/use-course";
import SimpleLayout from "@/layout/SimpleLayout.tsx";
import { CheckoutForm } from "@/sections/courses/detail/checkout/CheckoutForm";
import { formatPrice } from "@/utils/formatPrice";
import { formatVideoDuration } from "@/utils/formatVideoDuration";
import { Award, BookOpen, CheckCircle, Clock } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense } from "react";

const Checkout = () => {
  const params = useParams();
  const courseId = params.coursesId as string;
  const { data: session } = useSession();
  const user = session?.user;

  const { data, isLoading } = useCourse(courseId);

  const course = data?.course;

  if (isLoading) {
    return <CheckoutLoading />;
  }

  return (
    <SimpleLayout>
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Lengkapi Pembelian Anda</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Checkout Form - Left Side (2/3 on medium screens) */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Detail Pembayaran</h2>
              <Suspense fallback={<div>Loading payment form...</div>}>
                <CheckoutForm course={course} user={user} />
              </Suspense>
            </Card>
          </div>

          {/* Course Summary - Right Side (1/3 on medium screens) */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="relative aspect-video rounded-md overflow-hidden mb-4">
                {course?.imageUrl ? (
                  <Image
                    src={course?.imageUrl}
                    alt={course?.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-gray-400" />
                  </div>
                )}
              </div>

              <h3 className="text-lg font-medium mb-1">{course?.title}</h3>

              <div className="flex items-center text-sm text-muted-foreground gap-2 mb-3">
                <Clock className="h-4 w-4" />
                <span>
                  {formatVideoDuration(course?.duration as number) || 0}
                </span>
                <span>•</span>
                <Award className="h-4 w-4" />
                <span>
                  {(course?.level?.charAt(0).toUpperCase() ?? "") +
                    (course?.level?.slice(1).toLowerCase() ?? "")}
                </span>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Course price</span>
                  <span>
                    {(course?.price && formatPrice(course?.price as number)) ||
                      "0.00"}
                  </span>
                </div>

                <Separator className="my-3" />

                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>
                    {(course?.price && formatPrice(course?.price as number)) ||
                      "0.00"}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-medium">
                  Apa yang akan Anda dapatkan :
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Akses penuh seumur hidup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Akses di ponsel dan desktop</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Sertifikat penyelesaian</span>
                  </li>
                </ul>
              </div>
            </Card>

            <div className="text-center text-sm text-muted-foreground">
              <p>
                Punya pertanyaan?{" "}
                <Link href="/contact" className="underline">
                  Kontak support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
};

function CheckoutLoading() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      {/* Header skeleton */}
      <div className="h-10 w-64 bg-gray-200 rounded-md animate-pulse mb-8"></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Checkout Form Skeleton - Left Side (2/3 on medium screens) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            {/* Form header skeleton */}
            <div className="h-7 w-40 bg-gray-200 rounded-md animate-pulse mb-6"></div>

            {/* Form fields skeleton */}
            <div className="space-y-6">
              {/* Name field */}
              <div className="space-y-2">
                <div className="h-5 w-20 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <div className="h-5 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
              </div>

              <Separator />

              {/* Payment method header */}
              <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse mb-3"></div>

              {/* Payment methods skeleton */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="h-5 w-36 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="h-5 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="h-5 w-28 bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </div>

              {/* Payment details skeleton */}
              <div className="space-y-4">
                <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
                </div>
              </div>

              {/* Button skeleton */}
              <div className="pt-4">
                <div className="h-12 w-full bg-gray-200 rounded-md animate-pulse"></div>
                <div className="mt-3 h-4 w-full bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Course Summary Skeleton - Right Side (1/3 on medium screens) */}
        <div className="space-y-6">
          <Card className="p-6">
            {/* Summary header skeleton */}
            <div className="h-7 w-36 bg-gray-200 rounded-md animate-pulse mb-4"></div>

            {/* Course image skeleton */}
            <div className="relative aspect-video rounded-md bg-gray-200 animate-pulse mb-4"></div>

            {/* Course title skeleton */}
            <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse mb-3"></div>

            {/* Course info skeleton */}
            <div className="flex items-center gap-4 mb-3">
              <div className="h-5 w-24 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-5 w-24 bg-gray-200 rounded-md animate-pulse"></div>
            </div>

            <Separator className="my-4" />

            {/* Price skeletons */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="h-5 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-5 w-16 bg-gray-200 rounded-md animate-pulse"></div>
              </div>

              <Separator className="my-3" />

              <div className="flex justify-between">
                <div className="h-5 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-5 w-16 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </div>

            {/* What you'll get skeleton */}
            <div className="mt-6 space-y-3">
              <div className="h-6 w-32 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse shrink-0 mt-0.5"></div>
                    <div className="h-5 w-40 bg-gray-200 rounded-md animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Support text skeleton */}
          <div className="text-center">
            <div className="h-5 w-48 mx-auto bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;

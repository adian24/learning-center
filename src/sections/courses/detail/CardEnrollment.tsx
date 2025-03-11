"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

import { Skeleton } from "@/components/ui/skeleton";
import { useCourse } from "@/hooks/use-course";
import { formatPrice } from "@/utils/formatPrice";
import { formatVideoDuration } from "@/utils/formatVideoDuration";
import { Clock, FileText, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface CardEnrollmentProps {
  courseId: string;
}

const CardEnrollment = ({ courseId }: CardEnrollmentProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { data, isLoading } = useCourse(courseId);
  const course = data?.course;

  if (isLoading) {
    return <CardEnrollmentSkeleton />;
  }

  const handleEnrollCourse = () => {
    if (session?.user) {
      router.push(`/courses/${courseId}/learn`);
    } else {
      router.push("/sign-up");
    }
  };

  return (
    <div className="md:w-full">
      <Card className="sticky top-4">
        <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
          <Image
            src={course?.imageUrl || ""}
            alt={course?.title || "Course cover"}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {formatPrice(course?.price as number)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-md p-4 space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span>
                Durasi: {formatVideoDuration(course?.duration as number) ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <span>{course?.chapters?.length ?? 0} module</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              <span>Akses: Akses Penuh Seumur Hidup</span>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Enroll Course Sekarang
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Enroll Course?</AlertDialogTitle>
                <AlertDialogDescription>
                  {session?.user
                    ? "Course ini dapat Anda akses selamanya"
                    : "Anda harus masuk terlebih dahulu"}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleEnrollCourse}>
                  {session?.user ? "Enroll" : "Masuk"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-2">
          <p className="text-sm text-gray-500">30-Hari Jaminan Uang Kembali</p>
          <div className="w-full">
            <p className="text-xs font-medium mb-1">Bagikan Course ini:</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Bagikan ke X</span>
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Bagikan ke Facebook</span>
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Bagikan ke LinkedIn</span>
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

const CardEnrollmentSkeleton = () => {
  return (
    <div className="md:w-full">
      <Card className="sticky top-4">
        {/* Course cover image skeleton */}
        <Skeleton className="w-full h-48 rounded-t-lg" />

        <CardHeader>
          {/* Price skeleton */}
          <Skeleton className="h-8 w-36" />
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Course details box skeleton */}
          <div className="border rounded-md p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          {/* Demo button skeleton */}
          <Skeleton className="w-full h-10 rounded-md" />
        </CardContent>

        <CardFooter className="flex flex-col items-start space-y-2">
          {/* Guarantee text skeleton */}
          <Skeleton className="h-4 w-56" />

          <div className="w-full">
            {/* Share text skeleton */}
            <Skeleton className="h-4 w-32 mb-1" />

            {/* Social buttons skeleton */}
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CardEnrollment;

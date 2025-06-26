import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import db from "@/lib/db/db";
import PaymentInstructions from "@/views/courses/payment";

interface PaymentPageProps {
  params: Promise<{
    coursesId: string;
  }>;
  searchParams: Promise<{
    method: string;
    enrollment: string;
  }>;
}

export async function generateMetadata({
  params,
}: PaymentPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const course = await db.course.findUnique({
    where: { id: resolvedParams.coursesId },
  });

  return {
    title: course ? `Payment: ${course.title}` : "Complete Payment",
  };
}

export default async function PaymentPage({
  params,
  searchParams,
}: PaymentPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const { coursesId } = resolvedParams;
  const { method, enrollment: enrollmentId } = resolvedSearchParams;

  // Validate parameters
  if (!method || !enrollmentId) {
    return redirect(`/courses/${coursesId}/checkout`);
  }

  const session = await auth();

  if (!session?.user) {
    return redirect(`/auth/signin?callbackUrl=/courses/${coursesId}/checkout`);
  }

  // Get user and student profile
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { studentProfile: true },
  });

  if (!user || !user.studentProfile) {
    return redirect("/");
  }

  // Get enrollment
  const enrollment = await db.enrolledCourse.findUnique({
    where: {
      id: enrollmentId,
      studentId: user.studentProfile.id,
    },
    include: {
      course: {
        include: {
          teacher: {
            include: { user: true },
          },
        },
      },
      student: true,
    },
  });

  if (!enrollment) {
    return redirect(`/courses/${coursesId}/checkout`);
  }

  // If payment already completed, redirect to success page
  if (enrollment.status === "COMPLETED") {
    return redirect(`/courses/${coursesId}/success?enrollment=${enrollmentId}`);
  }

  // Generate payment instructions using Midtrans API (if needed)
  // This is usually handled by the client component based on the payment method

  return (
    <div className="container max-w-6xl mx-auto py-12">
      <PaymentInstructions
        enrollment={enrollment}
        paymentMethod={method}
        courseId={coursesId}
      />
    </div>
  );
}

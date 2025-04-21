import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import db from "@/lib/db/db";
import BankTransferPayment from "@/sections/courses/payment/BankTransferPayment";

interface BankTransferPageProps {
  params: Promise<{
    coursesId: string;
  }>;
  searchParams: Promise<{
    name: string;
    enrollment?: string;
  }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: BankTransferPageProps): Promise<Metadata> {
  const courseId = (await params).coursesId;
  const bankName = (await searchParams).name || "";

  const course = await db.course.findUnique({
    where: { id: courseId },
  });

  return {
    title: course
      ? `${bankName.toUpperCase()} Bank Transfer - ${course.title}`
      : "Bank Transfer Payment",
  };
}

export default async function BankTransferPage({
  params,
  searchParams,
}: BankTransferPageProps) {
  const courseId = (await params).coursesId;
  const { name: bankName, enrollment: enrollmentId } = await searchParams;

  if (!courseId || !bankName) {
    return redirect("/courses");
  }

  // Validate bank name
  const validBanks = ["bca", "bni", "bri", "mandiri", "permata"];
  if (!validBanks.includes(bankName.toLowerCase())) {
    return redirect(`/courses/${courseId}/checkout`);
  }

  const session = await auth();

  if (!session?.user) {
    return redirect(`/auth/signin?callbackUrl=/courses/${courseId}/checkout`);
  }

  // Get user and student profile
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { studentProfile: true },
  });

  if (!user || !user.studentProfile) {
    return redirect("/");
  }

  // Get course details
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      teacher: {
        include: { user: true },
      },
    },
  });

  if (!course) {
    return redirect("/courses");
  }

  // If enrollmentId is provided, fetch the existing enrollment
  let enrollment = null;
  if (enrollmentId) {
    enrollment = await db.enrolledCourse.findUnique({
      where: {
        id: enrollmentId,
        studentId: user.studentProfile.id,
      },
      include: {
        course: true,
      },
    });

    // If payment already completed, redirect to success page
    if (enrollment && enrollment.status === "COMPLETED") {
      return redirect(
        `/courses/${courseId}/success?enrollment=${enrollmentId}`
      );
    }
  }

  return (
    <div className="container max-w-6xl mx-auto py-12">
      <BankTransferPayment
        courseId={courseId}
        course={course}
        bankName={bankName.toLowerCase()}
        user={user}
        existingEnrollment={enrollment}
      />
    </div>
  );
}

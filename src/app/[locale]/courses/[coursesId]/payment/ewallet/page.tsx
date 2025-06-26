import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import db from "@/lib/db/db";
import EWalletPayment from "@/sections/courses/payment/EWalletPayment";

interface EWalletPaymentPageProps {
  params: Promise<{
    coursesId: string;
  }>;
  searchParams: Promise<{
    type: string;
    enrollment?: string;
  }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: EWalletPaymentPageProps): Promise<Metadata> {
  const courseId = (await params).coursesId;
  const ewalletType = (await searchParams).type || "";

  const course = await db.course.findUnique({
    where: { id: courseId },
  });

  const walletName = ewalletType.charAt(0).toUpperCase() + ewalletType.slice(1);

  return {
    title: course
      ? `${walletName} Payment - ${course.title}`
      : "E-Wallet Payment",
  };
}

export default async function EWalletPaymentPage({
  params,
  searchParams,
}: EWalletPaymentPageProps) {
  const courseId = (await params).coursesId;
  const { type: ewalletType, enrollment: enrollmentId } = await searchParams;

  // Validate parameters
  if (!courseId || !ewalletType) {
    return redirect("/courses");
  }

  // Validate e-wallet type
  const validEwallets = ["gopay", "shopeepay", "dana", "ovo"];
  if (!validEwallets.includes(ewalletType.toLowerCase())) {
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
      <EWalletPayment
        courseId={courseId}
        course={course}
        ewalletType={ewalletType.toLowerCase()}
        user={user}
        existingEnrollment={enrollment}
      />
    </div>
  );
}

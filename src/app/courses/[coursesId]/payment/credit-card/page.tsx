import { redirect } from "next/navigation";
import { Metadata } from "next";
import db from "@/lib/db/db";
import { auth } from "@/lib/auth";
import CreditCardContainer from "@/sections/courses/payment/CreditCardContainer";

interface CreditCardPageProps {
  params: Promise<{
    coursesId: string;
  }>;
}

export async function generateMetadata({
  params,
}: CreditCardPageProps): Promise<Metadata> {
  const courseId = (await params).coursesId;

  if (!courseId) {
    return {
      title: "Payment - Credit Card",
    };
  }

  return {
    title: `Credit Card Payment - Learning Center`,
  };
}

export default async function CreditCardPage({ params }: CreditCardPageProps) {
  const courseId = (await params).coursesId;

  if (!courseId) {
    console.error("Course ID is undefined");
    // Handle error case
    return <div>Course not found</div>;
  }

  const session = await auth();

  if (!session?.user) {
    return redirect(
      `/auth/signin?callbackUrl=/courses/${courseId}/payment/credit-card`
    );
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
  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: {
          include: { user: true },
        },
        chapters: {
          where: { isPublished: true },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!course) {
      console.error(`Course not found for ID: ${courseId}`);
      return redirect("/courses");
    }

    // Check if user is already enrolled with completed status
    const existingEnrollment = await db.enrolledCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId: user.studentProfile.id,
          courseId,
        },
      },
    });

    if (existingEnrollment && existingEnrollment.status === "COMPLETED") {
      return redirect(`/courses/${courseId}`);
    }

    return (
      <div className="container max-w-6xl mx-auto py-12">
        <CreditCardContainer course={course} user={user} courseId={courseId} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching course data:", error);
    console.error("Course ID that caused error:", courseId);
    return redirect("/courses");
  }
}

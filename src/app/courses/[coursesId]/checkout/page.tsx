import SimpleLayout from "@/layout/SimpleLayout.tsx";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import Checkout from "@/views/courses/checkout";
import { Metadata } from "next";
import { redirect } from "next/navigation";

interface CheckoutPageProps {
  params: Promise<{
    coursesId: string;
  }>;
}

export async function generateMetadata({
  params,
}: CheckoutPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const course = await db.course.findUnique({
    where: { id: resolvedParams.coursesId },
  });

  return {
    title: course ? `Checkout: ${course.title}` : "Checkout",
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const resolvedParams = await params;
  const { coursesId } = resolvedParams;
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

  // Get course details
  const course = await db.course.findUnique({
    where: { id: coursesId },
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
    return redirect("/courses");
  }

  // Check if user is already enrolled
  const existingEnrollment = await db.enrolledCourse.findUnique({
    where: {
      studentId_courseId: {
        studentId: user.studentProfile.id,
        courseId: coursesId,
      },
    },
  });

  if (existingEnrollment && existingEnrollment.status === "COMPLETED") {
    return redirect(`/courses/${coursesId}`);
  }

  return (
    <SimpleLayout>
      <div className="container max-w-6xl mx-auto py-12">
        <Checkout
          course={course}
          user={user}
          studentProfileId={user.studentProfile.id}
        />
      </div>
    </SimpleLayout>
  );
}

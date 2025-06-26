import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import SnapCheckoutPage from "@/views/courses/snap-checkout";
import SimpleLayout from "@/layout/SimpleLayout.tsx";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pembayaran | E-Learning",
  description: "Selesaikan pembayaran menggunakan Midtrans",
};

interface SnapCheckoutProps {
  params: Promise<{
    coursesId: string;
  }>;
}

export default async function SnapCheckout({ params }: SnapCheckoutProps) {
  const session = await auth();

  if (!session?.user) {
    const courseId = (await params).coursesId;
    return redirect(
      `/auth/signin?callbackUrl=/courses/${courseId}/snap-checkout`
    );
  }

  const courseId = (await params).coursesId;

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

  // Check if already enrolled
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
    <SimpleLayout>
      <div className="container py-12">
        <SnapCheckoutPage
          course={{
            id: course.id,
            title: course.title,
            description: course.description ?? "",
            imageUrl: course.imageUrl ?? "",
            price: course.price ?? 0,
          }}
          user={{
            name: user.name || undefined,
            email: user.email || undefined,
            phone: undefined, // Add phone if available
          }}
        />
      </div>
    </SimpleLayout>
  );
}

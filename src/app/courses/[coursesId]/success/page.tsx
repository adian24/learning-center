import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { formatPrice } from "@/utils/formatPrice";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface SuccessPageProps {
  params: Promise<{
    coursesId: string;
  }>;
  searchParams: Promise<{
    enrollment?: string;
  }>;
}

export default async function SuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const session = await auth();

  if (!session?.user) {
    return redirect("/auth/signin");
  }

  const courseId = (await params).coursesId;
  const enrollmentId = (await searchParams).enrollment;

  const studentProfile = await db.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!studentProfile) {
    return redirect("/");
  }

  // Get the enrollment
  let enrollment;

  if (enrollmentId) {
    // If enrollment ID is provided, get that specific enrollment
    enrollment = await db.enrolledCourse.findUnique({
      where: {
        id: enrollmentId,
        studentId: studentProfile.id,
        courseId: courseId,
      },
      include: {
        course: true,
      },
    });
  } else {
    // Otherwise, try to find by course and student
    enrollment = await db.enrolledCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId: studentProfile.id,
          courseId: courseId,
        },
      },
      include: {
        course: true,
      },
    });
  }

  if (!enrollment) {
    return redirect(`/courses/${courseId}`);
  }

  // Get the first chapter to redirect the user
  const firstChapter = await db.chapter.findFirst({
    where: {
      courseId: courseId,
      isPublished: true,
    },
    orderBy: {
      position: "asc",
    },
  });

  // Determine status message and UI based on enrollment status
  let statusMessage = "";
  let statusColor = "";

  switch (enrollment.status) {
    case "COMPLETED":
      statusMessage = "Your payment has been completed successfully.";
      statusColor = "text-green-600";
      break;
    case "PENDING":
      statusMessage =
        "Your payment is being processed. You will gain access once the payment is confirmed.";
      statusColor = "text-amber-600";
      break;
    case "FAILED":
      statusMessage =
        "Payment failed. Please try again or contact customer support.";
      statusColor = "text-red-600";
      break;
    default:
      statusMessage = "Enrollment status: " + enrollment.status;
      statusColor = "text-gray-600";
  }

  return (
    <div className="flex flex-col items-center justify-center max-w-3xl mx-auto py-16 px-4">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          {enrollment.status === "COMPLETED" ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : enrollment.status === "PENDING" ? (
            <Loader2 className="h-16 w-16 text-amber-500 animate-spin" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-500 text-2xl">!</span>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-2">
          {enrollment.status === "COMPLETED"
            ? "Enrollment Successful!"
            : enrollment.status === "PENDING"
            ? "Enrollment Pending"
            : "Enrollment Failed"}
        </h1>

        <p className={`mb-6 ${statusColor}`}>{statusMessage}</p>

        {enrollment.status === "COMPLETED" ||
        enrollment.status === "PENDING" ? (
          <p className="text-gray-600 mb-6">
            Thank you for enrolling in "{enrollment.course.title}"
          </p>
        ) : (
          <p className="text-gray-600 mb-6">
            There was an issue with your enrollment in "
            {enrollment.course.title}"
          </p>
        )}

        {enrollment.amount > 0 && (
          <p className="text-gray-600 mb-6">
            Amount: {formatPrice(enrollment.amount)}
          </p>
        )}

        {enrollment.paymentId && (
          <p className="text-gray-500 text-sm mb-6">
            Transaction ID: {enrollment.paymentId}
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {firstChapter && enrollment.status === "COMPLETED" && (
          <Link href={`/courses/${courseId}/chapters/${firstChapter.id}`}>
            <Button size="lg">Start Learning</Button>
          </Link>
        )}

        {enrollment.status === "PENDING" && (
          <div className="text-center text-sm text-gray-600 mb-6">
            <p>
              Once your payment is confirmed, you'll be able to access the
              course.
              <br />
              This may take a few moments to process.
            </p>
          </div>
        )}

        {enrollment.status === "FAILED" && (
          <Link href={`/checkout/${courseId}/checkout`}>
            <Button size="lg">Try Again</Button>
          </Link>
        )}

        {enrollment.status === "PENDING" && (
          <Link href="/courses">
            <Button variant="outline" size="lg">
              Go to the Courses
            </Button>
          </Link>
        )}

        {enrollment.status === "COMPLETED" && (
          <Link href={`/courses/${courseId}`}>
            <Button variant="outline" size="lg">
              Go to My Course
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

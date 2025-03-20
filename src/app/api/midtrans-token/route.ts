import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { snap } from "@/lib/midtrans";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db/db";

const truncateText = (text: string, maxLength = 20) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

// Input validation schema
const paymentRequestSchema = z.object({
  courseId: z.string(),
  amount: z.number().positive(),
  currency: z.string().default("IDR"),
});

export async function POST(req: NextRequest) {
  try {
    // Get current user session
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const result = paymentRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { courseId, amount, currency } = result.data;

    // Get student profile
    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: true },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    // Get course details
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: { teacher: { include: { user: true } } },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if student already enrolled
    const existingEnrollment = await db.enrolledCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId: studentProfile.id,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment && existingEnrollment.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // Generate unique transaction ID
    const transactionId = `ORDER-${uuidv4()}`;

    // Create payment record in database with PENDING status
    let enrollment;

    if (existingEnrollment) {
      // Update existing enrollment to PENDING
      enrollment = await db.enrolledCourse.update({
        where: { id: existingEnrollment.id },
        data: {
          status: "PENDING",
          amount: amount,
          currency: currency,
          paymentId: transactionId,
          isActive: false,
        },
      });
    } else {
      // Create new enrollment with PENDING status
      enrollment = await db.enrolledCourse.create({
        data: {
          studentId: studentProfile.id,
          courseId: course.id,
          amount: amount,
          currency: currency,
          status: "PENDING",
          paymentId: transactionId,
          isActive: false,
        },
      });
    }

    const truncatedTitle = truncateText(course.title, 20);

    // Set up the transaction details for Midtrans
    const parameter = {
      transaction_details: {
        order_id: transactionId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: session.user.name || "Student",
        email: session.user.email || "",
      },
      item_details: [
        {
          id: course.id,
          price: amount,
          quantity: 1,
          name: truncatedTitle,
        },
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}/success`,
      },
    };

    // Create transaction token
    const token = await snap.createTransactionToken(parameter);

    return NextResponse.json({
      token,
      transactionId,
      enrollmentId: enrollment.id,
    });
  } catch (error) {
    console.error("Midtrans token error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}

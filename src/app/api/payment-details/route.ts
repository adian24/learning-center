import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

// Input validation schema
const paymentDetailsSchema = z.object({
  enrollmentId: z.string(),
});

// Define an interface for payment details
interface PaymentDetails {
  status: any;
  amount: number;
  currency: string;
  paymentId: string | null;
  transactionStatus: string;
  isPending?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    // Get current user session
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const result = paymentDetailsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { enrollmentId } = result.data;

    // Get enrollment
    const enrollment = await db.enrolledCourse.findUnique({
      where: { id: enrollmentId },
      include: { student: true },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Verify that the enrollment belongs to the current user
    if (enrollment.student.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Determine transaction status based on enrollment status
    let transactionStatus: string;
    let isPending = false;

    if (enrollment.status === "PENDING") {
      transactionStatus = "pending";
      isPending = true;
    } else if (enrollment.status === "COMPLETED") {
      transactionStatus = "settlement";
    } else if (enrollment.status === "FAILED") {
      transactionStatus = "failed";
    } else {
      transactionStatus = "pending";
      isPending = true;
    }

    // Return simplified payment details
    const paymentDetails: PaymentDetails = {
      status: enrollment.status,
      amount: enrollment.amount,
      currency: enrollment.currency,
      paymentId: enrollment.paymentId,
      transactionStatus,
      isPending,
    };

    return NextResponse.json(paymentDetails);
  } catch (error) {
    console.error("Get payment details error:", error);
    return NextResponse.json(
      { error: "Failed to get payment details" },
      { status: 500 }
    );
  }
}

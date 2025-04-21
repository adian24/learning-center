import { NextRequest, NextResponse } from "next/server";
import { coreApi } from "@/lib/midtrans";
import { z } from "zod";
import db from "@/lib/db/db";
import { auth } from "@/lib/auth";

// Input validation schema
const checkStatusSchema = z.object({
  enrollmentId: z.string(),
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
    const result = checkStatusSchema.safeParse(body);

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

    // If enrollment is already completed, no need to check
    if (enrollment.status === "COMPLETED") {
      return NextResponse.json({
        status: "COMPLETED",
        enrollmentId: enrollment.id,
      });
    }

    // If no payment ID, we can't check status
    if (!enrollment.paymentId) {
      return NextResponse.json(
        { error: "No payment ID associated with this enrollment" },
        { status: 400 }
      );
    }

    // Get transaction status from Midtrans
    const transactionStatus = await coreApi.transaction.status(
      enrollment.paymentId
    );

    console.log("Midtrans transaction status:", transactionStatus);

    // Update enrollment status based on transaction status
    let newStatus: "PENDING" | "COMPLETED" | "FAILED" = "PENDING";

    if (
      transactionStatus.transaction_status === "capture" ||
      transactionStatus.transaction_status === "settlement"
    ) {
      newStatus = "COMPLETED";
    } else if (
      transactionStatus.transaction_status === "deny" ||
      transactionStatus.transaction_status === "cancel" ||
      transactionStatus.transaction_status === "expire"
    ) {
      newStatus = "FAILED";
    }

    // Update enrollment status
    const updatedEnrollment = await db.enrolledCourse.update({
      where: { id: enrollment.id },
      data: {
        status: newStatus,
        isActive: newStatus === "COMPLETED",
      },
    });

    return NextResponse.json({
      status: newStatus,
      transactionStatus: transactionStatus.transaction_status,
      enrollmentId: updatedEnrollment.id,
    });
  } catch (error) {
    console.error("Check payment status error:", error);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}

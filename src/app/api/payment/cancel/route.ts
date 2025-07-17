import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { z } from "zod";
import { coreApi } from "@/lib/midtrans";

// Input validation schema
const cancelPaymentSchema = z.object({
  orderId: z.string(),
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
    const result = cancelPaymentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { orderId } = result.data;

    // Get student profile
    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    // Find the enrollment by paymentId
    const enrollment = await db.enrolledCourse.findFirst({
      where: { 
        paymentId: orderId,
        studentId: studentProfile.id
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Cancel transaction in Midtrans
    try {
      await coreApi.transaction.cancel(orderId);
    } catch (error) {
      console.error("Midtrans cancel error:", error);
      // Continue even if Midtrans cancel fails
    }

    // Update enrollment status to FAILED
    await db.enrolledCourse.update({
      where: { id: enrollment.id },
      data: {
        status: "FAILED",
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel payment error:", error);
    return NextResponse.json(
      {
        error: "Failed to cancel payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
// import { coreApi } from "@/lib/midtrans";
import db from "@/lib/db/db";

// Input validation schema for 3DS callback
const callbackSchema = z.object({
  transaction_id: z.string(),
  order_id: z.string(),
  status_code: z.string(),
  transaction_status: z.string(),
  gross_amount: z.string(),
  payment_type: z.string(),
  signature_key: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const result = callbackSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid callback data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { order_id, transaction_status, status_code, signature_key } =
      result.data;

    // Verify callback signature (if needed)
    // This would require implementing specific signature verification logic
    // based on Midtrans documentation

    // Find the enrollment by paymentId (order_id)
    const enrollment = await db.enrolledCourse.findFirst({
      where: { paymentId: order_id },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found for this transaction" },
        { status: 404 }
      );
    }

    // Verify transaction status with Midtrans Core API (optional extra verification)
    // const transactionStatus = await midtrans.transaction.status(order_id);

    // Update enrollment status based on transaction status
    let newStatus: "PENDING" | "COMPLETED" | "FAILED";

    if (
      transaction_status === "capture" ||
      transaction_status === "settlement"
    ) {
      // Payment successful
      newStatus = "COMPLETED";
    } else if (
      transaction_status === "deny" ||
      transaction_status === "cancel" ||
      transaction_status === "expire"
    ) {
      // Payment failed
      newStatus = "FAILED";
    } else {
      // Payment still pending
      newStatus = "PENDING";
    }

    // Update enrollment in database
    await db.enrolledCourse.update({
      where: { id: enrollment.id },
      data: {
        status: newStatus,
        isActive: newStatus === "COMPLETED",
      },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      status: newStatus,
      enrollmentId: enrollment.id,
      orderId: order_id,
    });
  } catch (error) {
    console.error("3DS callback error:", error);
    return NextResponse.json(
      {
        error: "Failed to process 3DS callback",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

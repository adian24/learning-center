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

    const { order_id, transaction_status } = result.data;

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

    // Update enrollment status based on transaction status
    let newStatus: "PENDING" | "COMPLETED" | "FAILED";

    switch (transaction_status) {
      case "capture":
      case "settlement":
        newStatus = "COMPLETED";
        break;
      case "deny":
      case "cancel":
      case "expire":
      case "failure":
      case "refund":
      case "chargeback":
      case "partial_refund":
      case "partial_chargeback":
        newStatus = "FAILED";
        break;
      case "pending":
      case "authorize":
      default:
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

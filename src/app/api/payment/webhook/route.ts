import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();

    // Extract necessary data
    const {
      order_id,
      transaction_status,
      status_code,
      signature_key,
      gross_amount,
    } = body;

    // Validate the signature if present (for production)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";

    if (signature_key && process.env.NODE_ENV === "production") {
      // Reconstruct the string to hash
      const stringToHash = order_id + status_code + gross_amount + serverKey;

      // Create SHA-512 hash
      const calculatedSignature = crypto
        .createHash("sha512")
        .update(stringToHash)
        .digest("hex");

      // Verify signature
      if (calculatedSignature !== signature_key) {
        console.error("Invalid signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    // Find the enrollment by paymentId (order_id)
    const enrollment = await db.enrolledCourse.findFirst({
      where: { paymentId: order_id },
    });

    if (!enrollment) {
      console.error(`Enrollment not found for order_id: ${order_id}`);
      return NextResponse.json(
        { error: "Enrollment not found for this transaction" },
        { status: 404 }
      );
    }

    console.log(
      `Processing webhook for order_id: ${order_id}, status: ${transaction_status}`
    );

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

    // Log transaction details
    console.log(`Updated enrollment ${enrollment.id} status to ${newStatus}`);
    console.log(`Payment type: ${body.payment_type}, Amount: ${gross_amount}`);

    return NextResponse.json({
      success: true,
      status: newStatus,
      message: `Transaction ${order_id} status updated to ${newStatus}`,
    });
  } catch (error) {
    console.error("Payment webhook error:", error);
    return NextResponse.json(
      {
        error: "Failed to process payment notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

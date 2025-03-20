import { NextRequest, NextResponse } from "next/server";
import { snap } from "@/lib/midtrans";
import db from "@/lib/db/db";

export async function POST(req: NextRequest) {
  try {
    // Parse the notification JSON
    const notification = await req.json();

    // Verify the notification signature from Midtrans
    const isVerified = await snap.verifySignature(notification);

    if (!isVerified) {
      console.error("Invalid signature for Midtrans notification");
      return NextResponse.json(
        { status: "error", message: "Invalid signature" },
        { status: 403 }
      );
    }

    const orderId = notification.order_id; // This is our transactionId (TRX-xxx)
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    // Find the enrollment by paymentId
    const enrollment = await db.enrolledCourse.findFirst({
      where: { paymentId: orderId },
    });

    if (!enrollment) {
      console.error(`Enrollment not found for transaction ID: ${orderId}`);
      return NextResponse.json(
        { status: "error", message: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Update enrollment status based on transaction status
    if (transactionStatus === "capture") {
      // The transaction is successful (credit card payment)
      if (fraudStatus === "challenge") {
        // Need manual review, keep as PENDING
        await updateEnrollmentStatus(enrollment.id, "PENDING");
      } else if (fraudStatus === "accept") {
        // Payment accepted
        await updateEnrollmentStatus(enrollment.id, "COMPLETED");
      }
    } else if (transactionStatus === "settlement") {
      // Non-card payment methods like bank transfer have been paid
      await updateEnrollmentStatus(enrollment.id, "COMPLETED");
    } else if (
      transactionStatus === "deny" ||
      transactionStatus === "cancel" ||
      transactionStatus === "expire"
    ) {
      // Payment failed or canceled
      await updateEnrollmentStatus(enrollment.id, "FAILED");
    } else if (transactionStatus === "pending") {
      // Payment is pending
      await updateEnrollmentStatus(enrollment.id, "PENDING");
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Midtrans webhook error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to update enrollment status
async function updateEnrollmentStatus(
  enrollmentId: string,
  status: "PENDING" | "COMPLETED" | "REFUNDED" | "FAILED"
) {
  await db.enrolledCourse.update({
    where: { id: enrollmentId },
    data: {
      status: status,
      isActive: status === "COMPLETED",
      // If payment is completed, set validUntil to null (unlimited access) or calculate based on your business logic
      validUntil: status === "COMPLETED" ? null : undefined,
    },
  });
}

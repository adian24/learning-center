import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { coreApi } from "@/lib/midtrans";

export async function POST(req: NextRequest) {
  try {
    // Get current user session
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { enrollmentId } = body;

    if (!enrollmentId) {
      return NextResponse.json(
        { error: "Enrollment ID is required" },
        { status: 400 }
      );
    }

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

    // Get enrollment
    const enrollment = await db.enrolledCourse.findUnique({
      where: {
        id: enrollmentId,
        studentId: studentProfile.id,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // If enrollment is already completed, return success
    if (enrollment.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        status: "COMPLETED",
        enrollmentId,
      });
    }

    // Check status with Midtrans if payment ID exists
    if (enrollment.paymentId) {
      try {
        const transaction = await coreApi.transaction.status(
          enrollment.paymentId
        );

        // Update enrollment based on transaction status
        let newStatus: "PENDING" | "COMPLETED" | "FAILED";

        switch (transaction.transaction_status) {
          case "capture":
          case "settlement":
            newStatus = "COMPLETED";
            break;
          case "deny":
          case "cancel":
          case "expire":
            newStatus = "FAILED";
            break;
          default:
            newStatus = "PENDING";
        }

        // Only update if status has changed
        if (enrollment.status !== newStatus) {
          await db.enrolledCourse.update({
            where: { id: enrollment.id },
            data: {
              status: newStatus,
              isActive: newStatus === "COMPLETED",
            },
          });
        }

        return NextResponse.json({
          success: true,
          status: newStatus,
          transactionStatus: transaction.transaction_status,
          enrollmentId,
        });
      } catch (error) {
        console.error("Error checking transaction status:", error);
        // Return current status if we can't check with Midtrans
        return NextResponse.json({
          success: true,
          status: enrollment.status,
          enrollmentId,
          error: "Could not check with payment provider",
        });
      }
    }

    // Return current status if no payment ID
    return NextResponse.json({
      success: true,
      status: enrollment.status,
      enrollmentId,
    });
  } catch (error) {
    console.error("Check payment status error:", error);
    return NextResponse.json(
      {
        error: "Failed to check payment status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

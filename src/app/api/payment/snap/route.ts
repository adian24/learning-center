// src/app/api/payment/snap/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { z } from "zod";
import { snap, coreApi } from "@/lib/midtrans";

// Input validation schema
const snapPaymentSchema = z.object({
  courseId: z.string(),
  amount: z.number().positive(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional(),
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
    const result = snapPaymentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid payment data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { courseId, amount, customerName, customerEmail, customerPhone } =
      result.data;

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
      include: {
        teacher: {
          include: { user: true },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if student already enrolled with COMPLETED status
    const existingEnrollment = await db.enrolledCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId: studentProfile.id,
          courseId,
        },
      },
    });

    if (existingEnrollment && existingEnrollment.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      );
    }

    // Generate unique transaction ID or check existing one for pending payments
    let transactionId;
    let enrollment;
    let shouldCreateNewToken = true;

    if (existingEnrollment && existingEnrollment.status === "PENDING" && existingEnrollment.paymentId) {
      // Check transaction status from Midtrans first
      try {
        const statusResponse = await coreApi.transaction.status(existingEnrollment.paymentId);
        
        // If transaction is still pending/active, we can't create new token
        if (statusResponse.transaction_status === "pending") {
          return NextResponse.json(
            { 
              error: "Payment is still pending", 
              message: "Please complete the existing payment or wait for it to expire",
              existingOrderId: existingEnrollment.paymentId
            }, 
            { status: 409 }
          );
        }
        
        // If transaction expired, cancel, or failed, create new token
        if (["expire", "cancel", "deny", "failure"].includes(statusResponse.transaction_status)) {
          transactionId = `ORDER-${uuidv4().substring(0, 8)}`;
          shouldCreateNewToken = true;
        }
      } catch (error) {
        // If transaction not found in Midtrans, create new token
        transactionId = `ORDER-${uuidv4().substring(0, 8)}`;
        shouldCreateNewToken = true;
      }
    } else {
      // Generate new transaction ID for new payments
      transactionId = `ORDER-${uuidv4().substring(0, 8)}`;
    }

    if (existingEnrollment) {
      // Update existing enrollment to PENDING with new transaction ID
      enrollment = await db.enrolledCourse.update({
        where: { id: existingEnrollment.id },
        data: {
          status: "PENDING",
          amount,
          currency: "IDR",
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
          amount,
          currency: "IDR",
          status: "PENDING",
          paymentId: transactionId,
          isActive: false,
        },
      });
    }

    // Prepare transaction details for Snap
    const parameter = {
      transaction_details: {
        order_id: transactionId,
        gross_amount: amount,
      },
      item_details: [
        {
          id: course.id,
          price: amount,
          quantity: 1,
          name:
            course.title.length > 50
              ? course.title.substring(0, 47) + "..."
              : course.title,
        },
      ],
      customer_details: {
        first_name: customerName || studentProfile.user.name || "Student",
        email: customerEmail || studentProfile.user.email,
        phone: customerPhone || "",
      },
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}/success?enrollment=${enrollment.id}`,
        error: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}/checkout?error=payment_failed`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}/payment?method=pending&enrollment=${enrollment.id}`,
      },
      credit_card: {
        secure: true,
      },
      expiry: {
        unit: "hour",
        duration: 24,
      },
    };

    // Create Snap transaction token
    const transaction = await snap.createTransaction(parameter);

    // Return the Snap token and redirect URL
    return NextResponse.json({
      success: true,
      enrollmentId: enrollment.id,
      transactionId,
      snapToken: transaction.token,
      redirectUrl: transaction.redirect_url,
    });
  } catch (error) {
    console.error("Snap payment token generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate payment token",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

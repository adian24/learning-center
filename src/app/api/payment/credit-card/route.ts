import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { coreApi, truncateText } from "@/lib/midtrans";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

// Input validation schema
const creditCardPaymentSchema = z.object({
  courseId: z.string(),
  amount: z.number().positive(),
  cardNumber: z.string().min(13).max(19),
  cardExpiry: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, "Invalid expiry format (MM/YY)"),
  cardCvv: z.string().min(3).max(4),
  cardholderName: z.string().min(3),
  saveCard: z.boolean().optional().default(false),
  phone: z.string().min(10).max(15),
  tokenId: z.string().optional(),
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
    const result = creditCardPaymentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid payment data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { courseId, amount, cardholderName, phone, tokenId } = result.data;

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

    // Generate unique transaction ID
    const transactionId = `ORDER-${uuidv4()}`;

    // Create or update enrollment record with PENDING status
    let enrollment;

    if (existingEnrollment) {
      // Update existing enrollment to PENDING
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

    // Format card data for Midtrans
    const truncatedTitle = truncateText(course.title, 50);

    // Build payload for Midtrans Core API
    const paymentPayload = {
      payment_type: "credit_card",
      transaction_details: {
        order_id: transactionId,
        gross_amount: amount,
      },
      credit_card: {
        token_id: tokenId,
        authentication: true,
        bank: "bni",
        // callback_type: "js_event",
        // secure: true,
      },
      customer_details: {
        first_name: cardholderName,
        email: session.user.email,
        phone,
      },
      item_details: [
        {
          id: course.id,
          price: amount,
          quantity: 1,
          name: truncatedTitle,
        },
      ],
    };

    console.log("paymentPayload : ", paymentPayload);

    // Send payment request to Midtrans Core API
    const chargeResponse = await coreApi.charge(paymentPayload);

    // Handle different response scenarios based on payment status
    let paymentStatus = "PENDING";
    let redirectUrl = null;

    if (
      chargeResponse.status_code === "200" ||
      chargeResponse.status_code === "201"
    ) {
      // If transaction requires 3DS authentication
      if (chargeResponse.redirect_url) {
        redirectUrl = chargeResponse.redirect_url;
      }

      // If transaction is successful immediately (rare for credit cards with 3DS)
      else if (
        chargeResponse.transaction_status === "capture" ||
        chargeResponse.transaction_status === "settlement"
      ) {
        paymentStatus = "COMPLETED";

        // Update enrollment status
        await db.enrolledCourse.update({
          where: { id: enrollment.id },
          data: {
            status: "COMPLETED",
            isActive: true,
          },
        });
      }
    } else {
      // Transaction failed
      paymentStatus = "FAILED";

      await db.enrolledCourse.update({
        where: { id: enrollment.id },
        data: {
          status: "FAILED",
        },
      });
    }

    // Return response with payment details
    return NextResponse.json({
      success: true,
      enrollmentId: enrollment.id,
      transactionId,
      status: paymentStatus,
      redirectUrl,
      cardMasked: chargeResponse.masked_card || null,
      transactionStatus: chargeResponse.transaction_status,
      transactionTime: chargeResponse.transaction_time,
      fraudStatus: chargeResponse.fraud_status,
    });
  } catch (error) {
    console.error("Credit card payment error:", error);
    return NextResponse.json(
      {
        error: "Failed to process credit card payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

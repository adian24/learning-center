import { NextRequest, NextResponse } from "next/server";
import { coreApi, truncateText } from "@/lib/midtrans";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { z } from "zod";

const formatDateForMidtrans = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const tzOffset = date.getTimezoneOffset();
  const tzSign = tzOffset <= 0 ? "+" : "-";
  const tzHours = String(Math.abs(Math.floor(tzOffset / 60))).padStart(2, "0");
  const tzMinutes = String(Math.abs(tzOffset % 60)).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${tzSign}${tzHours}${tzMinutes}`;
};

// Input validation schema
const bankTransferSchema = z.object({
  courseId: z.string(),
  amount: z.number().positive(),
  bankName: z.enum(["bca", "bni", "bri", "mandiri", "permata"]),
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
    const result = bankTransferSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid payment data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { courseId, amount, bankName } = result.data;

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
    const transactionId = `ORDER-${uuidv4().substring(0, 8)}`;

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

    const truncatedTitle = truncateText(course.title, 50);

    // Prepare bank transfer details based on bank
    let bankTransferDetails = {};

    if (bankName === "permata") {
      bankTransferDetails = {
        payment_type: "bank_transfer",
        bank_transfer: {
          bank: "permata",
        },
      };
    } else {
      bankTransferDetails = {
        payment_type: "bank_transfer",
        bank_transfer: {
          bank: bankName,
        },
      };
    }

    // Build payload for Midtrans Core API
    const paymentPayload = {
      ...bankTransferDetails,
      transaction_details: {
        order_id: transactionId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: studentProfile.user.name || "Student",
        email: studentProfile.user.email,
        phone: "",
      },
      item_details: [
        {
          id: course.id,
          price: amount,
          quantity: 1,
          name: truncatedTitle,
        },
      ],
      custom_expiry: {
        order_time: formatDateForMidtrans(new Date()),
        expiry_duration: 24,
        unit: "hour",
      },
    };

    // Send payment request to Midtrans Core API
    const chargeResponse = await coreApi.charge(paymentPayload);

    // Handle response based on bank type
    let vaNumber = "";

    if (bankName === "permata") {
      vaNumber = chargeResponse.permata_va_number;
    } else {
      vaNumber = chargeResponse.va_numbers?.[0]?.va_number || "";
    }

    // Format response
    return NextResponse.json({
      success: true,
      enrollmentId: enrollment.id,
      transactionId,
      status: "PENDING",
      vaNumber,
      bank: bankName,
      expiryTime: chargeResponse.expiry_time,
      amount: chargeResponse.gross_amount,
      transactionTime: chargeResponse.transaction_time,
    });
  } catch (error) {
    console.error("Bank transfer payment error:", error);
    return NextResponse.json(
      {
        error: "Failed to process bank transfer payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { coreApi, truncateText } from "@/lib/midtrans";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { z } from "zod";

// Input validation schema
const ewalletSchema = z.object({
  courseId: z.string(),
  amount: z.number().positive(),
  ewalletType: z.enum(["gopay", "shopeepay", "dana", "ovo"]),
  callbackUrl: z.string().url().optional(),
  phone: z.string().optional(),
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
    const result = ewalletSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid payment data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { courseId, amount, ewalletType, callbackUrl, phone } = result.data;

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

    const truncatedTitle = truncateText(course.title, 50);

    // Build e-wallet specific configuration
    let ewalletConfig = {};

    switch (ewalletType) {
      case "gopay":
        ewalletConfig = {
          payment_type: "gopay",
          gopay: {
            enable_callback: true,
            callback_url:
              callbackUrl ||
              `${process.env.NEXT_PUBLIC_APP_URL}/payment/3ds-redirect?course_id=${courseId}`,
          },
        };
        break;
      case "shopeepay":
        ewalletConfig = {
          payment_type: "shopeepay",
          shopeepay: {
            callback_url:
              callbackUrl ||
              `${process.env.NEXT_PUBLIC_APP_URL}/payment/3ds-redirect?course_id=${courseId}`,
          },
        };
        break;
      case "dana":
        // DANA requires specific integration through QRIS
        ewalletConfig = {
          payment_type: "qris",
          qris: {
            acquirer: "gopay",
          },
        };
        break;
      case "ovo":
        // OVO requires phone number in the request
        ewalletConfig = {
          payment_type: "ovo",
          ovo: {
            phone: phone || "",
          },
        };
        break;
      default:
        return NextResponse.json(
          { error: "Unsupported e-wallet type" },
          { status: 400 }
        );
    }

    // Build payload for Midtrans Core API
    const paymentPayload = {
      ...ewalletConfig,
      transaction_details: {
        order_id: transactionId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: studentProfile.user.name || "Student",
        email: studentProfile.user.email,
        phone: phone || "",
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
        expiry_duration: 60, // 60 minutes
        unit: "minute",
      },
    };

    // Send payment request to Midtrans Core API
    const chargeResponse = await coreApi.charge(paymentPayload);

    // Extract specific data depending on the e-wallet type
    let responseData: {
      enrollmentId: string;
      transactionId: string;
      status: string;
      amount: any;
      expiryTime: any;
      ewalletType: "gopay" | "shopeepay" | "dana" | "ovo";
      qrCodeUrl?: string | null;
      deepLinkUrl?: string | null;
    } = {
      enrollmentId: enrollment.id,
      transactionId,
      status: "PENDING",
      amount: chargeResponse.gross_amount,
      expiryTime: chargeResponse.expiry_time || null,
      ewalletType: ewalletType,
    };

    // Add e-wallet specific data
    if (ewalletType === "gopay") {
      const qrCodeUrl =
        chargeResponse.actions?.find(
          (action: any) => action.name === "generate-qr-code"
        )?.url || null;
      const deepLinkUrl =
        chargeResponse.actions?.find(
          (action: any) => action.name === "deeplink-redirect"
        )?.url || null;

      responseData = {
        ...responseData,
        qrCodeUrl,
        deepLinkUrl,
      };
    } else if (ewalletType === "shopeepay") {
      responseData = {
        ...responseData,
        deepLinkUrl:
          chargeResponse.actions?.find(
            (action: any) => action.name === "deeplink-redirect"
          )?.url || null,
        qrCodeUrl:
          chargeResponse.actions?.find(
            (action: any) => action.name === "generate-qr-code"
          )?.url || null,
      };
    } else if (ewalletType === "dana") {
      responseData = {
        ...responseData,
        qrCodeUrl:
          chargeResponse.actions?.find(
            (action: any) => action.name === "generate-qr-code"
          )?.url || null,
      };
    }

    return NextResponse.json({
      success: true,
      ...responseData,
    });
  } catch (error) {
    console.error("E-wallet payment error:", error);
    return NextResponse.json(
      {
        error: "Failed to process e-wallet payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

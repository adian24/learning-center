import { NextRequest, NextResponse } from "next/server";
import { coreApi } from "@/lib/midtrans";
import { z } from "zod";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

// Input validation schema
const paymentDetailsSchema = z.object({
  enrollmentId: z.string(),
});

// Define an interface for payment details
interface PaymentDetails {
  status: any;
  amount: number;
  currency: string;
  paymentId: string;
  transactionStatus: any;
  expiryTime: any;
  paymentType?: string;
  vaNumbers?: Array<{ bank: string; vaNumber: string }>;
  qrCodeUrl?: string | null;
  deepLinkUrl?: string | null;
  cardMasked?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    // Get current user session
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const result = paymentDetailsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: result.error.format() },
        { status: 400 }
      );
    }

    const { enrollmentId } = result.data;

    // Get enrollment
    const enrollment = await db.enrolledCourse.findUnique({
      where: { id: enrollmentId },
      include: { student: true },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Verify that the enrollment belongs to the current user
    if (enrollment.student.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If no payment ID, we can't get details
    if (!enrollment.paymentId) {
      return NextResponse.json(
        { error: "No payment ID associated with this enrollment" },
        { status: 400 }
      );
    }

    // Get transaction status and details from Midtrans
    const transactionDetails = await coreApi.transaction.status(
      enrollment.paymentId
    );

    // Format payment details based on payment type
    let paymentDetails: PaymentDetails = {
      status: enrollment.status,
      amount: enrollment.amount,
      currency: enrollment.currency,
      paymentId: enrollment.paymentId,
      transactionStatus: transactionDetails.transaction_status,
      expiryTime: transactionDetails.expiry_time || null,
    };

    // Add additional details based on payment type
    if (transactionDetails.payment_type === "bank_transfer") {
      let vaNumbers = [];

      if (
        transactionDetails.va_numbers &&
        transactionDetails.va_numbers.length > 0
      ) {
        vaNumbers = transactionDetails.va_numbers.map((va: any) => ({
          bank: va.bank,
          vaNumber: va.va_number,
        }));
      } else if (transactionDetails.permata_va_number) {
        vaNumbers = [
          {
            bank: "permata",
            vaNumber: transactionDetails.permata_va_number,
          },
        ];
      }

      paymentDetails = {
        ...paymentDetails,
        paymentType: "bank_transfer",
        vaNumbers,
      };
    }

    // For e-wallets
    if (["gopay", "shopeepay"].includes(transactionDetails.payment_type)) {
      const actions = transactionDetails.actions || [];
      const qrCodeAction = actions.find(
        (action: any) => action.name === "generate-qr-code"
      );

      paymentDetails = {
        ...paymentDetails,
        paymentType: transactionDetails.payment_type,
        qrCodeUrl: qrCodeAction ? qrCodeAction.url : null,
        deepLinkUrl: transactionDetails.deeplink_redirect_url || null,
      };
    }

    // For credit cards
    if (transactionDetails.payment_type === "credit_card") {
      paymentDetails = {
        ...paymentDetails,
        paymentType: "credit_card",
        cardMasked: transactionDetails.masked_card || null,
      };
    }

    return NextResponse.json(paymentDetails);
  } catch (error) {
    console.error("Get payment details error:", error);
    return NextResponse.json(
      { error: "Failed to get payment details" },
      { status: 500 }
    );
  }
}

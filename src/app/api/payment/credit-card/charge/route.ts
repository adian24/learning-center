import { NextRequest, NextResponse } from "next/server";
import { coreApi, truncateText } from "@/lib/midtrans";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await req.json();

    // Validate required fields
    const {
      token_id,
      order_id,
      gross_amount,
      course_id,
      cardholder_name,
      phone,
    } = body;

    if (!token_id || !order_id || !gross_amount || !course_id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: token_id, order_id, gross_amount, or course_id",
        },
        { status: 400 }
      );
    }

    // Get course details
    const course = await db.course.findUnique({
      where: { id: course_id },
      select: { id: true, title: true, price: true },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    // Truncate course title to safe length
    const truncatedTitle = truncateText(course.title);

    // Prepare charge parameters
    const chargeParams = {
      payment_type: "credit_card",
      transaction_details: {
        order_id,
        gross_amount,
      },
      credit_card: {
        token_id,
        authentication: true,
        callback_type: "js_event",
      },
      customer_details: {
        first_name: cardholder_name || session.user.name,
        email: session.user.email,
        phone: phone || "",
      },
      item_details: [
        {
          id: course.id,
          price: gross_amount,
          quantity: 1,
          name: truncatedTitle,
        },
      ],
    };

    // Process the charge
    const chargeResponse = await coreApi.charge(chargeParams);

    return NextResponse.json({
      success: true,
      data: chargeResponse,
    });
  } catch (error: any) {
    console.error("Credit card charge error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "An error occurred during payment processing",
        error: error.ApiResponse || error,
      },
      { status: 500 }
    );
  }
}

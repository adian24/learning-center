import { NextRequest, NextResponse } from "next/server";
import { baseUrl } from "@/lib/midtrans";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const cardNumber = searchParams.get("card_number");
    const cardCvv = searchParams.get("card_cvv");
    const cardExpMonth = searchParams.get("card_exp_month");
    const cardExpYear = searchParams.get("card_exp_year");
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

    // Validate required parameters
    if (
      !cardNumber ||
      !cardCvv ||
      !cardExpMonth ||
      !cardExpYear ||
      !clientKey
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Construct the token request URL
    const tokenUrl = `${baseUrl}/token?card_number=${cardNumber}&card_cvv=${cardCvv}&card_exp_month=${cardExpMonth}&card_exp_year=${cardExpYear}&client_key=${clientKey}`;

    // Fetch token from Midtrans
    const response = await fetch(tokenUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          success: false,
          message: errorData.status_message || "Failed to get token",
          error: errorData,
        },
        { status: response.status }
      );
    }

    // Return the token response
    const tokenData = await response.json();
    return NextResponse.json({
      success: true,
      data: tokenData,
    });
  } catch (error: any) {
    console.error("Error getting credit card token:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "An error occurred while getting token",
        error,
      },
      { status: 500 }
    );
  }
}

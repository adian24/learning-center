import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/db";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    if (!user) {
      // User doesn't exist
      return NextResponse.json({ provider: null });
    }

    // Check if user has a password (credentials provider)
    const hasPassword = !!user.password;

    // Check if user has OAuth accounts
    const oauthProviders = user.accounts.map((account) => account.provider);
    const hasGoogle = oauthProviders.includes("google");

    // Determine primary provider
    let provider = null;
    if (hasGoogle && !hasPassword) {
      provider = "google";
    } else if (hasPassword && !hasGoogle) {
      provider = "credentials";
    } else if (hasGoogle && hasPassword) {
      // User has both - this shouldn't happen with our validation, but handle it
      provider = "both";
    }

    return NextResponse.json({
      provider,
      hasPassword,
      hasGoogle,
      email: user.email,
    });
  } catch (error) {
    console.error("Check provider error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

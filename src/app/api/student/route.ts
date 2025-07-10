import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user already has a student profile
    const existingStudent = await db.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: "Student profile already exists" },
        { status: 409 }
      );
    }

    // Create student profile
    const student = await db.studentProfile.create({
      data: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Error creating student profile:", error);
    return NextResponse.json(
      { error: "Failed to create student profile" },
      { status: 500 }
    );
  }
}

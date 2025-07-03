import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student profile
    const studentProfile = await db.studentProfile.findUnique({
      where: {
        userId: session?.user?.id,
      },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    // Get all certificates for this student
    const certificates = await db.certificate.findMany({
      where: {
        studentId: studentProfile.id,
      },
      include: {
        course: {
          include: {
            teacher: {
              include: {
                user: true,
                company: true,
              },
            },
            category: true,
          },
        },
      },
      orderBy: {
        issueDate: "desc",
      },
    });

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error("[CERTIFICATES_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}

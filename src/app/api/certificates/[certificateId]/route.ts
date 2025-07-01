import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const certificateId = (await params).certificateId;

    const certificate = await db.certificate.findUnique({
      where: {
        id: certificateId,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
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
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    // Verify the certificate belongs to the current user
    if (certificate.student.user.email !== session.user.email) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ certificate });
  } catch (error) {
    console.error("[CERTIFICATE_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch certificate" },
      { status: 500 }
    );
  }
}

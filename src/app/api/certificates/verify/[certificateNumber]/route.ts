import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ certificateNumber: string }> }
) {
  const certificateNumber = (await params).certificateNumber;

  try {
    // Public endpoint to verify certificate authenticity
    const certificate = await db.certificate.findUnique({
      where: {
        certificateNumber: certificateNumber,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                // Don't include email for privacy
              },
            },
          },
        },
        course: {
          select: {
            title: true,
            level: true,
            category: {
              select: {
                name: true,
              },
            },
            teacher: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
                company: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        {
          valid: false,
          message: "Certificate not found or invalid",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        issueDate: certificate.issueDate,
        studentName: certificate.student.user.name,
        courseTitle: certificate.course.title,
        courseLevel: certificate.course.level,
        category: certificate.course.category?.name,
        instructor: certificate.course.teacher.user.name,
        institution:
          certificate.course.teacher.company?.name || "Learning Center",
      },
    });
  } catch (error) {
    console.error("[CERTIFICATE_VERIFY]", error);
    return NextResponse.json(
      {
        valid: false,
        message: "Error verifying certificate",
      },
      { status: 500 }
    );
  }
}

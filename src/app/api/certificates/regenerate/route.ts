import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { generateCertificatePDF } from "@/lib/services/certificate-service";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { certificateId } = body;

    if (!certificateId) {
      return NextResponse.json(
        { error: "Certificate ID is required" },
        { status: 400 }
      );
    }

    // Get certificate with full data
    const certificate = await db.certificate.findUnique({
      where: { id: certificateId },
      include: {
        student: {
          include: { user: true },
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

    // Verify ownership
    if (certificate.student.user.email !== session.user.email) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Regenerate PDF
    const newPdfUrl = await generateCertificatePDF({
      certificate,
      student: certificate.student,
      course: certificate.course,
    });

    // Update certificate with new PDF URL
    const updatedCertificate = await db.certificate.update({
      where: { id: certificateId },
      data: { pdfUrl: newPdfUrl },
    });

    return NextResponse.json({
      message: "Certificate regenerated successfully",
      certificate: updatedCertificate,
    });
  } catch (error) {
    console.error("[CERTIFICATE_REGENERATE]", error);
    return NextResponse.json(
      { error: "Failed to regenerate certificate" },
      { status: 500 }
    );
  }
}

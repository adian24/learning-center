import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BUCKET_NAME, s3Client } from "@/lib/s3";
import db from "@/lib/db/db";

const BUCKET_PREFIX = "e-learning/";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const certificateId = searchParams.get("certificateId");

    if (!certificateId) {
      return NextResponse.json(
        { error: "Missing required parameter: certificateId" },
        { status: 400 }
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherProfile = await db.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const certificate = await db.certificate.findFirst({
      where: {
        id: certificateId,
        course: {
          teacherId: teacherProfile.id,
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    if (!certificate.pdfUrl) {
      return NextResponse.json(
        { error: "Certificate PDF not available" },
        { status: 404 }
      );
    }

    const url = new URL(certificate.pdfUrl);
    const fullPath = url.pathname.substring(1);
    const key = fullPath.startsWith(BUCKET_PREFIX)
      ? fullPath.substring(BUCKET_PREFIX.length)
      : fullPath;

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: `attachment; filename="certificate_${certificate.certificateNumber}.pdf"`,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });

    return NextResponse.json({ url: signedUrl, expiresIn: 300 });
  } catch (error) {
    console.error("[TEACHER_CERTIFICATE_DOWNLOAD]", error);
    return NextResponse.json(
      { error: "Failed to generate certificate download URL" },
      { status: 500 }
    );
  }
}

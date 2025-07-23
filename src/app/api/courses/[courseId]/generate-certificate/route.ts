import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { generateCertificatePDF } from "@/lib/services/certificate-service";
import { randomBytes } from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = params;

    // Get student data
    const student = await db.student.findUnique({
      where: { 
        email: session.user.email 
      },
      include: { 
        user: true 
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Check if student is enrolled and course is completed
    const enrollment = await db.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Student not enrolled in this course" },
        { status: 403 }
      );
    }

    // Check course completion
    const courseProgress = await db.userProgress.findMany({
      where: {
        studentId: student.id,
        chapter: {
          courseId: courseId,
        },
      },
      include: {
        chapter: true,
      },
    });

    const totalChapters = await db.chapter.count({
      where: { courseId: courseId },
    });

    const completedChapters = courseProgress.filter(
      (progress) => progress.isCompleted
    ).length;

    if (completedChapters !== totalChapters || totalChapters === 0) {
      return NextResponse.json(
        { error: "Course not completed yet" },
        { status: 400 }
      );
    }

    // Check if certificate already exists
    let certificate = await db.certificate.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: courseId,
        },
      },
    });

    // Get course data with all necessary relations
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: {
          include: {
            user: true,
            company: true,
          },
        },
        category: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // If certificate doesn't exist, create one
    if (!certificate) {
      // Generate unique certificate number
      const certificateNumber = `CERT-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`;
      
      certificate = await db.certificate.create({
        data: {
          certificateNumber,
          studentId: student.id,
          courseId: courseId,
          issueDate: new Date(),
          pdfUrl: "", // Will be updated after PDF generation
        },
      });
    }

    // Prepare certificate data for PDF generation
    const certificateData = {
      certificate: {
        id: certificate.id,
        certificateNumber: certificate.certificateNumber,
        issueDate: certificate.issueDate,
      },
      student: {
        user: {
          name: student.user.name,
          email: student.user.email,
        },
      },
      course: {
        title: course.title,
        description: course.description,
        level: course.level,
        teacher: {
          user: {
            name: course.teacher.user.name,
          },
          company: course.teacher.company,
        },
        category: course.category,
      },
    };

    // Generate PDF
    const pdfUrl = await generateCertificatePDF(certificateData);

    // Update certificate with PDF URL
    const updatedCertificate = await db.certificate.update({
      where: { id: certificate.id },
      data: { pdfUrl },
    });

    return NextResponse.json({
      message: "Certificate generated successfully",
      certificate: {
        id: updatedCertificate.id,
        certificateNumber: updatedCertificate.certificateNumber,
        issueDate: updatedCertificate.issueDate,
        pdfUrl: updatedCertificate.pdfUrl,
        course: {
          title: course.title,
          level: course.level,
        },
      },
    });
  } catch (error) {
    console.error("[GENERATE_CERTIFICATE]", error);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
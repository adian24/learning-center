import { jsPDF } from "jspdf";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "@/lib/s3";

interface CertificateData {
  certificate: {
    id: string;
    certificateNumber: string;
    issueDate: Date;
  };
  student: {
    user: {
      name: string | null;
      email: string | null;
    };
  };
  course: {
    title: string;
    description: string | null;
    level: string;
    teacher: {
      user: {
        name: string | null;
      };
      company?: {
        name: string;
        logoUrl: string | null;
      } | null;
    };
    category?: {
      name: string;
    } | null;
  };
}

export async function generateCertificatePDF(
  data: CertificateData
): Promise<string> {
  try {
    // Create new PDF document in landscape
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Colors
    const primaryColor = "#1e40af"; // blue-700
    const secondaryColor = "#64748b"; // slate-500
    const accentColor = "#f59e0b"; // amber-500

    // Certificate border
    doc.setLineWidth(2);
    doc.setDrawColor(primaryColor);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Inner border
    doc.setLineWidth(0.5);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

    // Header - Certificate Title
    doc.setFontSize(32);
    doc.setTextColor(primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("CERTIFICATE OF COMPLETION", pageWidth / 2, 40, {
      align: "center",
    });

    // Decorative line
    doc.setLineWidth(1);
    doc.setDrawColor(accentColor);
    doc.line(pageWidth / 2 - 50, 45, pageWidth / 2 + 50, 45);

    // Award text
    doc.setFontSize(14);
    doc.setTextColor(secondaryColor);
    doc.setFont("helvetica", "normal");
    doc.text("This is to certify that", pageWidth / 2, 60, { align: "center" });

    // Student name
    const studentName = data.student.user.name || "Student";
    doc.setFontSize(24);
    doc.setTextColor("#000000");
    doc.setFont("helvetica", "bold");
    doc.text(studentName, pageWidth / 2, 75, { align: "center" });

    // Completion text
    doc.setFontSize(14);
    doc.setTextColor(secondaryColor);
    doc.setFont("helvetica", "normal");
    doc.text(
      "has successfully completed the online course",
      pageWidth / 2,
      90,
      { align: "center" }
    );

    // Course title
    doc.setFontSize(20);
    doc.setTextColor(primaryColor);
    doc.setFont("helvetica", "bold");

    // Handle long course titles
    const courseTitle = data.course.title;
    const maxWidth = pageWidth - 60;
    const splitTitle = doc.splitTextToSize(courseTitle, maxWidth);

    if (Array.isArray(splitTitle)) {
      let yPosition = 105;
      splitTitle.forEach((line: string) => {
        doc.text(line, pageWidth / 2, yPosition, { align: "center" });
        yPosition += 8;
      });
    } else {
      doc.text(courseTitle, pageWidth / 2, 105, { align: "center" });
    }

    // Course details
    const courseLevel =
      data.course.level.charAt(0).toUpperCase() +
      data.course.level.slice(1).toLowerCase();
    const categoryName = data.course.category?.name || "General";

    doc.setFontSize(12);
    doc.setTextColor(secondaryColor);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Level: ${courseLevel} | Category: ${categoryName}`,
      pageWidth / 2,
      125,
      { align: "center" }
    );

    // Issue date
    const issueDate = new Date(data.certificate.issueDate);
    const formattedDate = issueDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    doc.setFontSize(11);
    doc.text(`Issued on ${formattedDate}`, pageWidth / 2, 140, {
      align: "center",
    });

    // Certificate number
    doc.setFontSize(10);
    doc.setTextColor("#666666");
    doc.text(
      `Certificate ID: ${data.certificate.certificateNumber}`,
      pageWidth / 2,
      150,
      { align: "center" }
    );

    // Footer section
    const footerY = pageHeight - 40;

    // Instructor signature area
    doc.setFontSize(10);
    doc.setTextColor("#000000");
    doc.setFont("helvetica", "normal");

    // Left side - Instructor
    const instructorName = data.course.teacher.user.name || "Instructor";
    doc.text("Instructor:", 40, footerY);
    doc.setFont("helvetica", "bold");
    doc.text(instructorName, 40, footerY + 8);

    // Signature line
    doc.setLineWidth(0.5);
    doc.setDrawColor("#000000");
    doc.line(40, footerY + 15, 120, footerY + 15);

    // Right side - Company/Platform
    doc.setFont("helvetica", "normal");
    const companyName = data.course.teacher.company?.name || "Learning Center";
    doc.text("Issued by:", pageWidth - 120, footerY);
    doc.setFont("helvetica", "bold");
    doc.text(companyName, pageWidth - 120, footerY + 8);

    // Signature line
    doc.line(pageWidth - 120, footerY + 15, pageWidth - 40, footerY + 15);

    // Watermark/Logo area (if company logo exists)
    if (data.course.teacher.company?.logoUrl) {
      // You can add logo loading and placement here
      // For now, we'll add a placeholder
      doc.setFontSize(8);
      doc.setTextColor("#cccccc");
      doc.text("Official Certificate", pageWidth / 2, pageHeight - 20, {
        align: "center",
      });
    }

    // Generate PDF buffer
    const pdfBuffer = doc.output("arraybuffer");

    // Upload to S3
    const fileName = `certificates/cert_${
      data.certificate.certificateNumber
    }_${Date.now()}.pdf`;
    const uploadResult = await uploadToS3(
      Buffer.from(pdfBuffer),
      fileName,
      "application/pdf"
    );

    return uploadResult.Location || uploadResult.url;
  } catch (error) {
    console.error("Error generating certificate PDF:", error);
    throw new Error("Failed to generate certificate PDF");
  }
}

// Helper function to validate certificate data
export function validateCertificateData(data: any): data is CertificateData {
  return (
    data &&
    data.certificate &&
    data.student &&
    data.course &&
    data.student.user &&
    data.course.teacher
  );
}

// Upload PDF buffer to S3
async function uploadToS3(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{ Location?: string; url: string }> {
  try {
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "max-age=31536000", // 1 year cache
      Metadata: {
        uploadedAt: new Date().toISOString(),
        type: "certificate"
      }
    });

    await s3Client.send(uploadCommand);

    // Return the URL where the file can be accessed
    const url = `${process.env.NEXT_PUBLIC_S3_ENDPOINT}/${BUCKET_NAME}/${fileName}`;
    
    return {
      Location: url,
      url: url
    };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload certificate to S3");
  }
}

// Function to regenerate certificate (if needed)
export async function regenerateCertificate(certificateId: string) {
  // Implementation for regenerating certificates
  // Useful for updating certificate templates or fixing issues
}

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Image,
} from "@react-pdf/renderer";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, BUCKET_NAME } from "@/lib/s3";

// Import asset untuk kasus browser (akan jadi URL oleh bundler)
import certTemplateUrl from "@/assets/cert-template.png";
import { Buffer } from "buffer";

/* ===================== TYPES ===================== */
interface CertificateData {
  certificate: {
    id: string;
    certificateNumber: string;
    issueDate: Date;
  };
  student: {
    user: { name: string | null; email: string | null };
  };
  course: {
    title: string;
    description: string | null;
    level: string;
    teacher: {
      user: { name: string | null };
      company?: { name: string; logoUrl: string | null } | null;
    };
    category?: { name: string } | null;
  };
}

/* ===================== CONFIG ===================== */
const COLOR_NAVY = "#0E3B70";
const COLOR_MUTED = "#3E4A5B";

// Relatif terhadap project root
const TEMPLATE_REL_PATH = "src/assets/cert-template.png";

/* ===================== POSISI TEKS (A4 landscape 842x595) ===================== */
// A4 landscape 842x595
// A4 landscape 842 x 595
const LAYOUT = {
  canvas: { w: 842, h: 595 },

  // “This participation certificate is given to”
  giveTo:      { top: 206, left: 60, width: 722 },

  // Nama peserta — dinaikkan dan jadi anchor spasi berikutnya
  studentName: { top: 244, left: 60, width: 722 },

  // “Has successfully …”
  hasSuccess:  { top: 310, left: 60, width: 722 },

  // Judul course
  courseTitle: { top: 335, left: 60, width: 722 },

  // Level | Category
  metaLine:    { top: 360, left: 60, width: 722 },

  // Certificate ID
  certId:      { top: 410, left: 60, width: 722 },

  // Footer
  bottomLogo:  { top: 462, w: 48, h: 48 },
  companyName: { top: 526, left: 60, width: 722 },
};


/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fff",
    padding: 0,
    fontFamily: "Helvetica",     // biar konsisten Times-Roman
  },
  container: {
    position: "relative",
    width: LAYOUT.canvas.w,
    height: LAYOUT.canvas.h,
  },
  bg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: LAYOUT.canvas.w,
    height: LAYOUT.canvas.h,
  },

  // “This participation certificate is given to”
  giveTo: {
    fontSize: 18,
    color: "#0E3B70",
    textAlign: "center",
    lineHeight: 1.3,
  },

  studentName: {
    fontFamily: "Times-Roman",
    fontSize: 42,
    color: "#0E3B70",
    textAlign: "center",
    fontStyle: "italic",
    fontWeight: 700,
    lineHeight: 1.15,              // jarak baris nama lebih proporsional
  },

  // “Has successfully completed the online course”
  hasSuccesfully: {
    fontSize: 16,                  // tetap besar tapi tidak menempel
    color: "#0E3B70",
    textAlign: "center",
    fontWeight: "normal",
    lineHeight: 1.35,
  },

  courseTitle: {
    fontSize: 18,
    color: "#0E3B70",
    textAlign: "center",
    fontWeight: 800,
    lineHeight: 1.3,
  },

  meta: {
    fontSize: 12.5,
    color: "#0E3B70",
    textAlign: "center",
    lineHeight: 1.35,
  },

  certId: {
    fontSize: 12,
    color: "#0E3B70",
    textAlign: "center",
    lineHeight: 1.35,
  },

  companyName: {
    fontSize: 12,
    color: "#0E3B70",
    textAlign: "center",
    fontWeight: 700,
  },
});



/* ===================== HELPERS ===================== */
async function getSecureImageUrl(imageKey: string): Promise<string | null> {
  if (!imageKey) return null;
  try {
    const cmd = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: imageKey });
    return await getSignedUrl(s3Client, cmd, { expiresIn: 3600 });
  } catch (e) {
    console.error("getSecureImageUrl error:", e);
    return null;
  }
}

/** Auto shrink nama jika terlalu panjang */
function fitNameFontSize(name: string): number {
  if (!name) return 42;
  if (name.length > 28) return 30;
  if (name.length > 22) return 34;
  if (name.length > 18) return 38;
  return 42;
}

/**
 * Resolve sumber template untuk React-PDF.
 * - Di server (Node): baca file sebagai Buffer (format 'png')
 * - Di browser: pakai URL hasil import bundler
 */
// GANTI fungsi sebelumnya
async function resolveTemplateSrc():
  Promise<string | { data: Buffer; format: "png" }> {
  if (typeof window === "undefined") {
    const fs = await import("fs");
    const path = await import("path");
    try {
      const abs = path.join(process.cwd(), "src/assets/cert-template.png");
      const file = await fs.promises.readFile(abs); // -> Buffer
      const bin = Buffer.isBuffer(file) ? file : Buffer.from(file);
      return { data: bin, format: "png" as const };
    } catch (e) {
      console.error("FS read failed, fallback to imported URL:", e);
      return certTemplateUrl as unknown as string;
    }
  }
  return certTemplateUrl as unknown as string;
}


/* ===================== DOCUMENT ===================== */
const TemplateCertificateDocument: React.FC<{
  data: CertificateData;
  templateSrc: string | { data: Buffer; format: "png" };
  companyLogoUrl?: string | null;
}> = ({ data, templateSrc, companyLogoUrl }) => {
  const studentName = data.student.user.name || "Participant";
  const courseTitle = data.course.title;
  const level =
    data.course.level?.charAt(0).toUpperCase() +
      data.course.level?.slice(1).toLowerCase() || "Beginner";
  const category = data.course.category?.name || "Professional Certification";
  const companyName =
    data.course.teacher.company?.name || "PT TSI SERTIFIKASI INTERNASIONAL";

  const nameSize = fitNameFontSize(studentName);
  const issueDate = new Date(data.certificate.issueDate);
  const formattedDate = issueDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.container}>
          {/* Background template */}
          <Image src={templateSrc} style={styles.bg} />

          {/* {studentName} */}
          <View
            style={{
              position: "absolute",
              top: LAYOUT.studentName.top,
              left: LAYOUT.studentName.left,
              width: LAYOUT.studentName.width,
            }}
          >
            <Text style={[styles.studentName, { fontSize: nameSize }]}>
              {studentName}
            </Text>
          </View>

          {/* “Has successfully …” */}
          <View style={{ position: "absolute", ...LAYOUT.hasSuccess }}>
            <Text style={styles.hasSuccesfully}>
              Has successfully completed the online course
            </Text>
          </View>
          {/* “{courseTitle}” */}
          <View
            style={{
              position: "absolute",
              top: LAYOUT.courseTitle.top,
              left: LAYOUT.courseTitle.left,
              width: LAYOUT.courseTitle.width,
            }}
          >
            <Text style={styles.courseTitle}>&quot;{courseTitle}&quot;</Text>
          </View>

          {/* Level & Category */}
          <View
            style={{
              position: "absolute",
              top: LAYOUT.metaLine.top,
              left: LAYOUT.metaLine.left,
              width: LAYOUT.metaLine.width,
            }}
          >
            <Text style={styles.meta}>
              Level : {level} | Category : {category}
            </Text>
            <Text style={styles.meta}>Issued on {formattedDate}</Text>
          </View>

          {/* Certificate ID */}
          <View
            style={{
              position: "absolute",
              top: LAYOUT.certId.top,
              left: LAYOUT.certId.left,
              width: LAYOUT.certId.width,
            }}
          >
            <Text style={styles.certId}>
              Certificate ID : {data.certificate.certificateNumber}
            </Text>
          </View>

          {/* Logo bottom center */}
          {companyLogoUrl && (
            <Image
              src={companyLogoUrl}
              style={{
                position: "absolute",
                top: LAYOUT.bottomLogo.top,
                left: (LAYOUT.canvas.w - LAYOUT.bottomLogo.w) / 2,
                width: LAYOUT.bottomLogo.w,
                height: LAYOUT.bottomLogo.h,
              }}
            />
          )}

          {/* {companyName} */}
          <View
            style={{
              position: "absolute",
              top: LAYOUT.companyName.top,
              left: LAYOUT.companyName.left,
              width: LAYOUT.companyName.width,
            }}
          >
            <Text style={styles.companyName}>{companyName.toUpperCase()}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

/* ===================== GENERATE + UPLOAD ===================== */
export async function generateCertificatePDF(data: CertificateData): Promise<string> {
  try {
    let companyLogoUrl: string | null = null;
    if (data.course.teacher.company?.logoUrl) {
      companyLogoUrl = await getSecureImageUrl(
        data.course.teacher.company.logoUrl
      );
    }

    const templateSrc = await resolveTemplateSrc();

    const doc = (
      <TemplateCertificateDocument
        data={data}
        templateSrc={templateSrc}
        companyLogoUrl={companyLogoUrl}
      />
    );

    const blob = await pdf(doc).toBlob();
    const buf = Buffer.from(await blob.arrayBuffer());

    const fileName = `certificates/cert_${data.certificate.certificateNumber}_${Date.now()}.pdf`;
    const res = await uploadToS3(buf, fileName, "application/pdf");
    return res.Location || res.url;
  } catch (e) {
    console.error("Error generating certificate PDF:", e);
    throw new Error("Failed to generate certificate PDF");
  }
}

/* ===================== VALIDATION & UPLOAD ===================== */
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

async function uploadToS3(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{ Location?: string; url: string }> {
  const upload = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: contentType,
    CacheControl: "max-age=31536000",
    Metadata: { uploadedAt: new Date().toISOString(), type: "certificate" },
  });
  await s3Client.send(upload);
  const url = `${process.env.NEXT_PUBLIC_S3_ENDPOINT}/${BUCKET_NAME}/${fileName}`;
  return { Location: url, url };
}

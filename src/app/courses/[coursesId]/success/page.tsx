import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import db from "@/lib/db/db";
import { formatPrice } from "@/utils/formatPrice";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface SuccessPageProps {
  params: Promise<{
    coursesId: string;
  }>;
  searchParams: Promise<{
    enrollment?: string;
  }>;
}

export default async function SuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const session = await auth();

  if (!session?.user) {
    return redirect("/auth/signin");
  }

  const courseId = (await params).coursesId;
  const enrollmentId = (await searchParams).enrollment;

  const studentProfile = await db.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!studentProfile) {
    return redirect("/");
  }

  // Get the enrollment
  let enrollment;

  if (enrollmentId) {
    // If enrollment ID is provided, get that specific enrollment
    enrollment = await db.enrolledCourse.findUnique({
      where: {
        id: enrollmentId,
        studentId: studentProfile.id,
        courseId: courseId,
      },
      include: {
        course: true,
      },
    });
  } else {
    // Otherwise, try to find by course and student
    enrollment = await db.enrolledCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId: studentProfile.id,
          courseId: courseId,
        },
      },
      include: {
        course: true,
      },
    });
  }

  if (!enrollment) {
    return redirect(`/courses/${courseId}`);
  }

  // Get the first chapter to redirect the user
  const firstChapter = await db.chapter.findFirst({
    where: {
      courseId: courseId,
      isPublished: true,
    },
    orderBy: {
      position: "asc",
    },
  });

  // Determine status message and UI based on enrollment status
  let statusMessage = "";
  let statusColor = "";

  switch (enrollment.status) {
    case "COMPLETED":
      statusMessage = "Pembayaran Anda telah berhasil diselesaikan.";
      statusColor = "text-green-600";
      break;
    case "PENDING":
      statusMessage =
        "Pembayaran Anda sedang diproses. Anda akan mendapatkan akses setelah pembayaran dikonfirmasi.";
      statusColor = "text-amber-600";
      break;
    case "FAILED":
      statusMessage =
        "Pembayaran gagal. Silakan coba lagi atau hubungi layanan pelanggan.";
      statusColor = "text-red-600";
      break;
    default:
      statusMessage = "Status pendaftaran: " + enrollment.status;
      statusColor = "text-gray-600";
  }

  return (
    <div className="flex flex-col items-center justify-center max-w-3xl mx-auto py-16 px-4">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          {enrollment.status === "COMPLETED" ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : enrollment.status === "PENDING" ? (
            <Loader2 className="h-16 w-16 text-amber-500 animate-spin" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-500 text-2xl">!</span>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-2">
          {enrollment.status === "COMPLETED"
            ? "Pendaftaran Berhasil!"
            : enrollment.status === "PENDING"
            ? "Pendaftaran Tertunda"
            : "Pendaftaran Gagal"}
        </h1>

        <p className={`mb-6 ${statusColor}`}>{statusMessage}</p>

        {enrollment.status === "COMPLETED" ||
        enrollment.status === "PENDING" ? (
          <p className="text-gray-600 mb-6">
            Terima kasih telah mendaftar di "{enrollment.course.title}"
          </p>
        ) : (
          <p className="text-gray-600 mb-6">
            Terjadi masalah dengan pendaftaran Anda di "
            {enrollment.course.title}"
          </p>
        )}

        {enrollment.amount > 0 && (
          <p className="text-gray-600 mb-6">
            Jumlah: {formatPrice(enrollment.amount)}
          </p>
        )}

        {enrollment.paymentId && (
          <p className="text-gray-500 text-sm mb-6">
            ID Transaksi: {enrollment.paymentId}
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {firstChapter && enrollment.status === "COMPLETED" && (
          <Link href={`/courses/${courseId}/chapters/${firstChapter.id}`}>
            <Button size="lg">Mulai Belajar</Button>
          </Link>
        )}

        {enrollment.status === "PENDING" && (
          <div className="text-center text-sm text-gray-600 mb-6">
            <p>
              Setelah pembayaran Anda dikonfirmasi, Anda akan dapat mengakses
              kursus.
              <br />
              Proses ini mungkin memakan waktu beberapa saat.
            </p>
          </div>
        )}

        {enrollment.status === "FAILED" && (
          <Link href={`/checkout/${courseId}/checkout`}>
            <Button size="lg">Coba Lagi</Button>
          </Link>
        )}

        {enrollment.status === "PENDING" && (
          <Link href="/courses">
            <Button variant="outline" size="lg">
              Lihat Semua Kursus
            </Button>
          </Link>
        )}

        {enrollment.status === "COMPLETED" && (
          <Link href={`/courses/${courseId}`}>
            <Button variant="outline" size="lg">
              Lihat Kursus Saya
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

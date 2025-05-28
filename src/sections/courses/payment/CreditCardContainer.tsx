"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/utils/formatPrice";
import { formatVideoDuration } from "@/utils/formatVideoDuration";
import {
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  ArrowLeft,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

import CreditCardForm from "./CreditCardForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CourseImageCard } from "@/components/media/SecureImage";

interface CreditCardContainerProps {
  course: any;
  user: any;
  courseId: string;
}

export default function CreditCardContainer({
  course,
  courseId,
}: CreditCardContainerProps) {
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState({
    isProcessingToken: false,
    isTokenValid: false,
    isProcessingPayment: false,
    message: null as string | null,
  });
  const router = useRouter();

  const handlePaymentSuccess = (enrollmentId: string) => {
    setEnrollmentId(enrollmentId);
    setPaymentSuccess(true);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleStatusUpdate = (status: {
    isProcessingToken: boolean;
    isTokenValid: boolean;
    isProcessingPayment: boolean;
    message?: string;
  }) => {
    setPaymentStatus({
      ...status,
      message: status.message || null,
    });

    // Clear error messages if token validation is successful
    if (status.isTokenValid && !status.isProcessingPayment) {
      setError(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Credit Card Form - Left Side (2/3 on medium screens) */}
      <div className="md:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>

          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Pembayaran Kartu Kredit</span>
          </div>
        </div>

        {/* Status Messages */}
        {paymentStatus.isProcessingToken && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start space-x-3">
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">Memvalidasi Kartu</h3>
              <p className="text-sm text-blue-700 mt-1">
                Mohon tunggu sementara kami memvalidasi kartu Anda...
              </p>
            </div>
          </div>
        )}

        {paymentStatus.isTokenValid && !paymentStatus.isProcessingPayment && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-800">Kartu Tervalidasi</h3>
              <p className="text-sm text-green-700 mt-1">
                Kartu kredit Anda telah divalidasi. Silakan lanjutkan dengan
                pembayaran.
              </p>
            </div>
          </div>
        )}

        {paymentStatus.isProcessingPayment && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start space-x-3">
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">
                Memproses Pembayaran
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Mohon tunggu sementara kami memproses pembayaran Anda...
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start space-x-3">
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Pembayaran Gagal</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 bg-white"
                onClick={() => setError(null)}
              >
                Coba Lagi
              </Button>
            </div>
          </div>
        )}

        {paymentStatus.message &&
          !error &&
          !paymentStatus.isTokenValid &&
          !paymentStatus.isProcessingToken && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800">Informasi</h3>
                <p className="text-sm text-amber-700 mt-1">
                  {paymentStatus.message}
                </p>
              </div>
            </div>
          )}

        <CreditCardForm
          courseId={courseId}
          amount={course.price || 0}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentError}
          onStatusUpdate={handleStatusUpdate}
        />

        {/* Payment Security Notice */}
        <Card className="p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-sm mb-1">Pembayaran Aman</h3>
              <p className="text-xs text-muted-foreground">
                Pembayaran Anda diproses dengan aman menggunakan enkripsi. Kami
                menggunakan 3D Secure untuk melindungi detail kartu Anda. Semua
                kartu kredit utama diterima termasuk Visa, Mastercard, Paypal
                dan JCB.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Course Summary - Right Side (1/3 on medium screens) */}
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>

          <div className="relative aspect-video rounded-md overflow-hidden mb-4">
            {course?.imageUrl ? (
              <CourseImageCard
                imageKey={course.imageUrl}
                courseId={courseId}
                courseTitle={course.title}
                className="aspect-video w-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-gray-400" />
              </div>
            )}
          </div>

          <h3 className="text-lg font-medium mb-1">{course?.title}</h3>

          <div className="flex items-center text-sm text-muted-foreground gap-2 mb-3">
            <Clock className="h-4 w-4" />
            <span>{formatVideoDuration(course?.duration || 0)}</span>
            <span>•</span>
            <Award className="h-4 w-4" />
            <span>
              {(course?.level?.charAt(0).toUpperCase() || "") +
                (course?.level?.slice(1).toLowerCase() || "")}
            </span>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Harga kursus</span>
              <span>{formatPrice(course?.price || 0)}</span>
            </div>

            <Separator className="my-3" />

            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatPrice(course?.price || 0)}</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium">Yang akan Anda dapatkan:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span>Akses seumur hidup</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span>Akses di perangkat mobile dan desktop</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span>Sertifikat penyelesaian</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span>{course?.chapters?.length || 0} modul pembelajaran</span>
              </li>
            </ul>
          </div>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Punya pertanyaan?{" "}
            <Link href="/contact" className="underline">
              Hubungi dukungan
            </Link>
          </p>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={paymentSuccess} onOpenChange={setPaymentSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pembayaran Berhasil!</DialogTitle>
            <DialogDescription>
              Pembayaran Anda telah diproses dengan sukses.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <p className="text-center mb-4">
            Anda sekarang memiliki akses penuh ke{" "}
            <span className="font-medium">{course?.title}</span>
          </p>

          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => {
                setPaymentSuccess(false);
                router.push(
                  `/courses/${courseId}/success?enrollment=${enrollmentId}`
                );
              }}
            >
              Pergi ke Kursus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

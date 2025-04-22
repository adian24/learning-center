"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  Smartphone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CountdownTimer } from "@/components/payments/CountdownTimer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/utils/formatPrice";
import { usePaymentStatus } from "@/hooks/use-payment-status";

// Import e-wallet logos
import gopayLogo from "@/assets/ewallet/gopay.png";
import shopeepayLogo from "@/assets/ewallet/shopeepay.png";
import danaLogo from "@/assets/ewallet/dana.png";
import ovoLogo from "@/assets/ewallet/ovo.png";

// E-wallet configuration with instructions
const EWALLET_CONFIG = {
  gopay: {
    name: "GoPay",
    logo: gopayLogo,
    instructions: [
      "Buka aplikasi Gojek di ponsel Anda",
      "Pilih menu 'Scan QR' pada aplikasi",
      "Scan QR code yang ditampilkan",
      "Periksa detail pembayaran dan konfirmasi",
      "Masukkan PIN GoPay Anda",
      "Pembayaran selesai",
    ],
    deepLinkInstructions: [
      "Klik tombol 'Buka di Aplikasi' di bawah ini",
      "Periksa detail pembayaran dan konfirmasi",
      "Masukkan PIN GoPay Anda",
      "Pembayaran selesai",
    ],
  },
  shopeepay: {
    name: "ShopeePay",
    logo: shopeepayLogo,
    instructions: [
      "Buka aplikasi Shopee di ponsel Anda",
      "Pilih menu 'Scan' pada aplikasi",
      "Scan QR code yang ditampilkan",
      "Periksa detail pembayaran dan konfirmasi",
      "Masukkan PIN ShopeePay Anda",
      "Pembayaran selesai",
    ],
    deepLinkInstructions: [
      "Klik tombol 'Buka di Aplikasi' di bawah ini",
      "Periksa detail pembayaran dan konfirmasi",
      "Masukkan PIN ShopeePay Anda",
      "Pembayaran selesai",
    ],
  },
  dana: {
    name: "DANA",
    logo: danaLogo,
    deepLinkInstructions: [],
    instructions: [
      "Buka aplikasi DANA di ponsel Anda",
      "Pilih menu 'Scan' pada aplikasi",
      "Scan QR code yang ditampilkan",
      "Periksa detail pembayaran dan konfirmasi",
      "Masukkan PIN DANA Anda",
      "Pembayaran selesai",
    ],
  },
  ovo: {
    name: "OVO",
    logo: ovoLogo,
    deepLinkInstructions: [],
    instructions: [
      "Buka aplikasi OVO di ponsel Anda",
      "Pilih menu 'Scan' pada aplikasi",
      "Scan QR code yang ditampilkan",
      "Periksa detail pembayaran dan konfirmasi",
      "Masukkan PIN OVO Anda",
      "Pembayaran selesai",
    ],
  },
};

interface EWalletPaymentProps {
  courseId: string;
  course: any;
  ewalletType: string;
  user: any;
  existingEnrollment: any;
}

export default function EWalletPayment({
  courseId,
  course,
  ewalletType,
  user,
  existingEnrollment,
}: EWalletPaymentProps) {
  const router = useRouter();
  const [isInitiating, setIsInitiating] = useState(!existingEnrollment);
  const [enrollmentId, setEnrollmentId] = useState<string>(
    existingEnrollment?.id || ""
  );
  const [countdown, setCountdown] = useState(60 * 60); // 60 minutes in seconds
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [deepLinkUrl, setDeepLinkUrl] = useState<string | null>(null);

  const ewalletConfig =
    EWALLET_CONFIG[ewalletType as keyof typeof EWALLET_CONFIG];

  // Effect to create new payment or handle existing payment
  useEffect(() => {
    if (existingEnrollment) {
      setIsInitiating(false);
      setEnrollmentId(existingEnrollment.id);
      return;
    }

    if (!isInitiating) return;

    const createNewPayment = async () => {
      try {
        // Get the current URL for callback
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        const callbackUrl = `${origin}/payment/3ds-redirect?course_id=${courseId}`;

        const response = await fetch("/api/payment/ewallet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseId,
            amount: course.price || 0,
            ewalletType,
            callbackUrl,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to initiate payment");
        }

        const data = await response.json();

        setPaymentDetails(data);
        setEnrollmentId(data.enrollmentId);
        setQrCodeUrl(data.qrCodeUrl || null);
        setDeepLinkUrl(data.deepLinkUrl || null);

        // If expiry time is available, calculate countdown
        if (data.expiryTime) {
          const expiryTime = new Date(data.expiryTime).getTime();
          const now = new Date().getTime();
          const initialSeconds = Math.max(
            0,
            Math.floor((expiryTime - now) / 1000)
          );
          setCountdown(initialSeconds);
        }

        setIsInitiating(false);
      } catch (error) {
        console.error("Error initiating payment:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to initiate payment. Please try again."
        );
        setIsInitiating(false);
      }
    };

    createNewPayment();
  }, [courseId, course.price, ewalletType, existingEnrollment, isInitiating]);

  // Get payment details for existing enrollment
  useEffect(() => {
    if (!existingEnrollment || !existingEnrollment.id) return;

    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch("/api/payment-details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            enrollmentId: existingEnrollment.id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch payment details");
        }

        const data = await response.json();
        setPaymentDetails(data);
        setQrCodeUrl(data.qrCodeUrl || null);
        setDeepLinkUrl(data.deepLinkUrl || null);

        // Calculate countdown from expiry time
        if (data.expiryTime) {
          const expiryTime = new Date(data.expiryTime).getTime();
          const now = new Date().getTime();
          const initialSeconds = Math.max(
            0,
            Math.floor((expiryTime - now) / 1000)
          );
          setCountdown(initialSeconds);
        }
      } catch (error) {
        console.error("Error fetching payment details:", error);
        setError("Failed to load payment details");
      }
    };

    fetchPaymentDetails();
  }, [existingEnrollment]);

  // Set up countdown timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Check payment status
  const { data: paymentStatus, refetch } = usePaymentStatus(
    enrollmentId,
    !!enrollmentId,
    5000 // Check every 5 seconds
  );

  // Show success dialog when payment completes
  useEffect(() => {
    if (paymentStatus?.status === "COMPLETED") {
      setSuccessDialogOpen(true);
    }
  }, [paymentStatus?.status]);

  // Handle opening deeplink
  const handleOpenApp = () => {
    if (!deepLinkUrl) {
      toast.error("No deeplink available");
      return;
    }

    // For mobile devices
    window.location.href = deepLinkUrl;

    // For desktop, show a notification
    setTimeout(() => {
      toast.info(
        "If the app didn't open automatically, please scan the QR code with your mobile device.",
        { duration: 5000 }
      );
    }, 1000);
  };

  // Handle payment status UI
  let statusUI;
  if (isInitiating) {
    statusUI = (
      <div className="flex items-center text-amber-600">
        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        <span>Mempersiapkan pembayaran...</span>
      </div>
    );
  } else if (paymentStatus?.status === "COMPLETED") {
    statusUI = (
      <div className="flex items-center text-green-600">
        <CheckCircle className="h-5 w-5 mr-2" />
        <span>Pembayaran berhasil!</span>
      </div>
    );
  } else if (paymentStatus?.status === "FAILED") {
    statusUI = (
      <div className="flex items-center text-red-600">
        <XCircle className="h-5 w-5 mr-2" />
        <span>Pembayaran gagal. Silakan coba lagi.</span>
      </div>
    );
  } else {
    statusUI = (
      <div className="flex items-center text-amber-600">
        <Clock className="h-5 w-5 mr-2" />
        <span>Menunggu pembayaran...</span>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="bg-red-100 rounded-full p-4 mb-4">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Payment Error</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <div className="flex gap-3">
          <Button onClick={() => router.push(`/courses/${courseId}/checkout`)}>
            Try Again
          </Button>
          <Button variant="outline" onClick={() => router.push("/courses")}>
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  // Render loading state
  if (isInitiating) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-semibold mb-2">Preparing Payment</h2>
        <p className="text-muted-foreground">
          Please wait while we set up your payment...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Payment Instructions - Left Side (9/12) */}
        <div className="md:col-span-9 space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>

            {/* Payment Status */}
            <div className="flex items-center space-x-3">
              {statusUI}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                title="Refresh payment status"
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              {ewalletConfig.logo && (
                <div className="h-12 w-16 relative bg-white flex items-center justify-center border rounded p-1">
                  <Image
                    src={ewalletConfig.logo}
                    alt={ewalletConfig.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <h2 className="text-xl font-semibold">{ewalletConfig.name}</h2>
            </div>

            <Separator className="mb-6" />

            {paymentStatus?.status === "COMPLETED" ? (
              // Payment Complete UI
              <div className="space-y-6">
                <div className="bg-green-50 rounded-lg p-6 text-center mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="bg-green-100 rounded-full p-4">
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-medium mb-2 text-green-700">
                    Pembayaran Berhasil!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Terima kasih. Pembayaran Anda telah berhasil diverifikasi.
                    Anda sekarang memiliki akses penuh ke kursus ini.
                  </p>
                  <Button
                    onClick={() => router.push(`/courses/${courseId}`)}
                    className="w-full md:w-auto"
                  >
                    Mulai Belajar Sekarang
                  </Button>
                </div>
              </div>
            ) : (
              // Payment Pending UI
              <div className="space-y-6">
                {qrCodeUrl && (
                  <div className="bg-primary/5 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-medium mb-4">
                      Scan QR Code dengan {ewalletConfig.name}
                    </h3>
                    <div className="flex justify-center mb-4">
                      <div className="border p-2 bg-white inline-block">
                        <Image
                          src={qrCodeUrl}
                          alt="QR Code"
                          width={200}
                          height={200}
                          className="object-contain"
                          style={{ maxWidth: "100%" }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Buka aplikasi {ewalletConfig.name} di ponsel Anda dan scan
                      QR code di atas.
                    </p>
                    {deepLinkUrl && (
                      <Button
                        onClick={handleOpenApp}
                        className="flex items-center gap-2"
                      >
                        <Smartphone className="h-4 w-4" />
                        Buka di Aplikasi
                      </Button>
                    )}
                  </div>
                )}

                {/* Payment Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Total Pembayaran
                    </div>
                    <div className="font-semibold">
                      {formatPrice(paymentDetails?.amount || course.price || 0)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Batas Waktu Pembayaran
                    </div>
                    {paymentDetails?.expiryTime ? (
                      <CountdownTimer
                        expiryTime={paymentDetails.expiryTime}
                        onExpire={() => setCountdown(0)}
                        showIcon={false}
                      />
                    ) : (
                      <div
                        className={`font-medium ${
                          countdown < 600 ? "text-red-600" : "text-amber-600"
                        }`}
                      >
                        {Math.floor(countdown / 60)}:
                        {(countdown % 60).toString().padStart(2, "0")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Instructions */}
                <div className="space-y-4">
                  <h3 className="font-medium">Cara Pembayaran</h3>

                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-3">
                      {deepLinkUrl
                        ? "Menggunakan Aplikasi (Rekomendasi)"
                        : "Langkah-langkah Pembayaran"}
                    </h4>
                    <ol className="space-y-2 list-decimal list-inside">
                      {deepLinkUrl
                        ? ewalletConfig.deepLinkInstructions?.map(
                            (step: string, index: number) => (
                              <li key={index} className="text-sm">
                                {step}
                              </li>
                            )
                          )
                        : ewalletConfig.instructions?.map((step, index) => (
                            <li key={index} className="text-sm">
                              {step}
                            </li>
                          ))}
                    </ol>
                  </div>
                </div>

                {/* Payment Notice */}
                <div className="mt-8 bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800">
                      Setelah pembayaran selesai, status akan diperbarui secara
                      otomatis. Jangan tutup halaman ini sampai pembayaran
                      selesai.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Course Summary - Right Side (3/12) */}
        <div className="md:col-span-3 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Ringkasan Pesanan</h2>

            <div className="relative aspect-video rounded-md overflow-hidden mb-4">
              {course?.imageUrl ? (
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200"></div>
              )}
            </div>

            <h3 className="font-medium mb-2 line-clamp-2">{course?.title}</h3>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Harga kursus</span>
                <span>{formatPrice(course?.price || 0)}</span>
              </div>

              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(course?.price || 0)}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              {paymentStatus?.status === "COMPLETED" ? (
                // Completed payment state
                <div className="text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-700">
                      Pembayaran Berhasil
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Anda telah berhasil membayar kursus ini.
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-2 p-0 h-auto text-primary"
                    onClick={() => router.push(`/courses/${courseId}`)}
                  >
                    Mulai Belajar
                  </Button>
                </div>
              ) : (
                // Pending payment state
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    <span>Menunggu pembayaran Anda</span>
                  </div>
                  <div>
                    Selesaikan pembayaran dalam:{" "}
                    <span
                      className={`font-medium ${
                        countdown < 600 ? "text-red-600" : "text-amber-600"
                      }`}
                    >
                      {Math.floor(countdown / 60)}:
                      {(countdown % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Butuh bantuan?{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Hubungi kami
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pembayaran Berhasil!</DialogTitle>
            <DialogDescription>
              Pembayaran Anda telah diverifikasi.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <p className="text-center mb-4">
            Anda sekarang memiliki akses penuh ke kursus{" "}
            <span className="font-medium">{course?.title}</span>
          </p>

          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => {
                setSuccessDialogOpen(false);
                router.push(
                  `/courses/${courseId}/success?enrollment=${enrollmentId}`
                );
              }}
            >
              Mulai Belajar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

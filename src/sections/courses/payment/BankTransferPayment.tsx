"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CountdownTimer } from "@/components/payments/CountdownTimer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatPrice } from "@/utils/formatPrice";
import {
  usePaymentDetails,
  usePaymentStatus,
} from "@/hooks/use-payment-status";

// Import bank logos
import bcaLogo from "@/assets/banks/bca.png";
import bniLogo from "@/assets/banks/bni.png";
import briLogo from "@/assets/banks/bri.png";
import mandiriLogo from "@/assets/banks/mandiri.png";
import permataLogo from "@/assets/banks/permata.png";

// Bank configuration with instructions
const BANK_CONFIG = {
  bca: {
    name: "BCA Virtual Account",
    logo: bcaLogo,
    instructions: [
      {
        title: "ATM BCA",
        steps: [
          "Masukkan kartu ATM BCA & PIN",
          "Pilih menu Transaksi Lainnya > Transfer > Virtual Account",
          "Masukkan nomor Virtual Account {va_number}",
          "Konfirmasi detail pembayaran",
          "Pembayaran selesai",
        ],
      },
      {
        title: "Mobile Banking BCA",
        steps: [
          "Login ke aplikasi BCA Mobile",
          "Pilih m-BCA, kemudian masukkan PIN m-BCA",
          "Pilih m-Transfer > BCA Virtual Account",
          "Masukkan nomor Virtual Account {va_number}",
          "Konfirmasi detail pembayaran",
          "Masukkan PIN m-BCA",
          "Pembayaran selesai",
        ],
      },
      {
        title: "Internet Banking BCA",
        steps: [
          "Login ke KlikBCA",
          "Pilih Transfer Dana > Transfer ke BCA Virtual Account",
          "Masukkan nomor Virtual Account {va_number}",
          "Klik Lanjutkan",
          "Konfirmasi detail pembayaran",
          "Masukkan kode dari KeyBCA appli",
          "Pembayaran selesai",
        ],
      },
    ],
  },
  bni: {
    name: "BNI Virtual Account",
    logo: bniLogo,
    instructions: [
      {
        title: "ATM BNI",
        steps: [
          "Masukkan kartu ATM BNI & PIN",
          "Pilih menu Transaksi Lainnya > Transfer > Virtual Account",
          "Masukkan nomor Virtual Account {va_number}",
          "Konfirmasi detail pembayaran",
          "Pembayaran selesai",
        ],
      },
      {
        title: "Mobile Banking BNI",
        steps: [
          "Login ke aplikasi BNI Mobile Banking",
          "Pilih Transfer > Virtual Account",
          "Masukkan nomor Virtual Account {va_number}",
          "Konfirmasi detail pembayaran",
          "Masukkan password transaksi",
          "Pembayaran selesai",
        ],
      },
    ],
  },
  bri: {
    name: "BRI Virtual Account",
    logo: briLogo,
    instructions: [
      {
        title: "ATM BRI",
        steps: [
          "Masukkan kartu ATM BRI & PIN",
          "Pilih menu Transaksi Lainnya > Pembayaran > Lainnya > BRIVA",
          "Masukkan nomor Virtual Account {va_number}",
          "Konfirmasi detail pembayaran",
          "Pembayaran selesai",
        ],
      },
      {
        title: "Mobile Banking BRI",
        steps: [
          "Login ke aplikasi BRImo",
          "Pilih Pembayaran > BRIVA",
          "Masukkan nomor Virtual Account {va_number}",
          "Konfirmasi detail pembayaran",
          "Masukkan PIN BRImo",
          "Pembayaran selesai",
        ],
      },
    ],
  },
  mandiri: {
    name: "Mandiri Virtual Account",
    logo: mandiriLogo,
    instructions: [
      {
        title: "ATM Mandiri",
        steps: [
          "Masukkan kartu ATM Mandiri & PIN",
          "Pilih menu Bayar/Beli > Lainnya > Multi Payment",
          "Masukkan kode perusahaan 70014",
          "Masukkan nomor Virtual Account {va_number}",
          "Konfirmasi detail pembayaran",
          "Pembayaran selesai",
        ],
      },
      {
        title: "Mandiri Online",
        steps: [
          "Login ke aplikasi Mandiri Online",
          "Pilih Pembayaran > Multipayment",
          "Pilih penyedia jasa Midtrans",
          "Masukkan nomor Virtual Account {va_number}",
          "Konfirmasi detail pembayaran",
          "Masukkan MPIN",
          "Pembayaran selesai",
        ],
      },
    ],
  },
  permata: {
    name: "Permata Virtual Account",
    logo: permataLogo,
    instructions: [
      {
        title: "ATM Permata",
        steps: [
          "Masukkan kartu ATM Permata & PIN",
          "Pilih menu Transaksi Lainnya > Pembayaran > Virtual Account",
          "Masukkan nomor Virtual Account {va_number}",
          "Konfirmasi detail pembayaran",
          "Pembayaran selesai",
        ],
      },
      {
        title: "PermataNet",
        steps: [
          "Login ke PermataNet",
          "Pilih Pembayaran > Virtual Account",
          "Masukkan nomor Virtual Account {va_number}",
          "Konfirmasi detail pembayaran",
          "Masukkan token code",
          "Pembayaran selesai",
        ],
      },
    ],
  },
};

// Function to format time for countdown
const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

interface BankTransferPaymentProps {
  courseId: string;
  course: any;
  bankName: string;
  user: any;
  existingEnrollment: any;
}

export default function BankTransferPayment({
  courseId,
  course,
  bankName,
  user,
  existingEnrollment,
}: BankTransferPaymentProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(24 * 60 * 60); // 24 hours in seconds
  const [vaNumber, setVaNumber] = useState<string>("");
  const [enrollmentId, setEnrollmentId] = useState<string>(
    existingEnrollment?.id || ""
  );
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isInitiating, setIsInitiating] = useState<boolean>(
    !existingEnrollment
  );
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bankConfig = BANK_CONFIG[bankName as keyof typeof BANK_CONFIG];

  // Use payment details hook for existing enrollment
  const {
    data: existingPaymentDetails,
    isLoading: isLoadingPaymentDetails,
    error: paymentDetailsError,
  } = usePaymentDetails(existingEnrollment?.id, !!existingEnrollment);

  // Effect to handle existing payment details
  useEffect(() => {
    if (existingEnrollment && existingPaymentDetails) {
      setPaymentDetails(existingPaymentDetails);
      setVaNumber(
        existingPaymentDetails.vaNumbers?.[0]?.vaNumber ||
          existingPaymentDetails.vaNumber ||
          ""
      );
      setEnrollmentId(existingEnrollment.id);

      // Calculate remaining time
      if (existingPaymentDetails.expiryTime) {
        const expiryTime = new Date(
          existingPaymentDetails.expiryTime
        ).getTime();
        const now = new Date().getTime();
        const initialSeconds = Math.max(
          0,
          Math.floor((expiryTime - now) / 1000)
        );
        setCountdown(initialSeconds);
      }

      setIsInitiating(false);
    }
  }, [existingEnrollment, existingPaymentDetails]);

  // Effect to handle payment details error
  useEffect(() => {
    if (paymentDetailsError) {
      setError("Failed to load payment details. Please try again.");
      setIsInitiating(false);
    }
  }, [paymentDetailsError]);

  // Effect to create new payment
  useEffect(() => {
    // Only create new payment if no existing enrollment
    if (existingEnrollment || !isInitiating) return;

    const createNewPayment = async () => {
      try {
        const response = await fetch("/api/payment/bank-transfer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            courseId,
            amount: course.price || 0,
            bankName,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to initiate payment");
        }

        const data = await response.json();
        setPaymentDetails(data);
        setVaNumber(data.vaNumber || "");
        setEnrollmentId(data.enrollmentId || "");

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
        setError("Failed to initiate payment. Please try again.");
        setIsInitiating(false);
      }
    };

    createNewPayment();
  }, [courseId, course.price, bankName, existingEnrollment, isInitiating]);

  // Set up countdown timer
  useEffect(() => {
    if (!paymentDetails || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentDetails, countdown]);

  // ...

  // Check payment status periodically
  const { data: paymentStatus, refetch } = usePaymentStatus(
    enrollmentId,
    !!enrollmentId,
    30000
  );

  // Show success dialog when payment completes
  useEffect(() => {
    if (paymentStatus?.status === "COMPLETED") {
      setSuccessDialogOpen(true);
    }
  }, [paymentStatus?.status]);

  // Copy VA number to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(vaNumber);
    toast.success("Nomor Virtual Account disalin");
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
              {bankConfig.logo && (
                <div className="h-12 w-16 relative bg-white flex items-center justify-center border rounded p-1">
                  <Image
                    src={bankConfig.logo}
                    alt={bankConfig.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <h2 className="text-xl font-semibold">{bankConfig.name}</h2>
            </div>

            <Separator className="mb-6" />

            {/* Virtual Account Number */}
            <div className="bg-primary/5 rounded-lg p-6 text-center mb-6">
              <h3 className="text-lg font-medium mb-4">
                Nomor Virtual Account
              </h3>
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="text-2xl font-mono font-semibold tracking-wider">
                  {vaNumber || "-"}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  className="h-8 w-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Bank {bankConfig.name.split(" ")[0]}
              </div>
            </div>

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
                      countdown < 3600 ? "text-red-600" : "text-amber-600"
                    }`}
                  >
                    {formatTime(countdown)}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="space-y-4">
              <h3 className="font-medium">Cara Pembayaran</h3>

              <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue="instructions-0"
              >
                {bankConfig.instructions.map((instruction, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`instructions-${idx}`}
                    className="border rounded-md px-4 mb-2"
                  >
                    <AccordionTrigger className="py-3">
                      {instruction.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ol className="space-y-2 list-decimal list-inside">
                        {instruction.steps.map((step, stepIdx) => (
                          <li key={stepIdx} className="text-sm">
                            {step.replace("{va_number}", vaNumber || "")}
                          </li>
                        ))}
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Payment Notice */}
            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800">
                  Pembayaran akan diproses secara otomatis oleh sistem. Mohon
                  tidak menutup halaman ini sampai proses pembayaran selesai.
                </p>
              </div>
            </div>
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
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  <span>Menunggu pembayaran Anda</span>
                </div>
                <p>
                  Selesaikan pembayaran dalam:{" "}
                  {paymentDetails?.expiryTime ? (
                    <CountdownTimer
                      expiryTime={paymentDetails.expiryTime}
                      onExpire={() => setCountdown(0)}
                      showIcon={false}
                      className="inline"
                    />
                  ) : (
                    <span
                      className={`font-medium ${
                        countdown < 3600 ? "text-red-600" : "text-amber-600"
                      }`}
                    >
                      {formatTime(countdown)}
                    </span>
                  )}
                </p>
              </div>
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

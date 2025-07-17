"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Copy,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Clock,
  RefreshCw,
  X,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatPrice } from "@/utils/formatPrice";
import visaLogo from "@/assets/international-payment/visa.png";
import mastercardLogo from "@/assets/international-payment/mastercard.png";
import paypalLogo from "@/assets/international-payment/paypal.png";
import jcbLogo from "@/assets/international-payment/jcb.png";
import { CourseImageCard } from "@/components/media/SecureImage";
import PendingPaymentCard from "@/components/payments/PendingPaymentCard";
import ExpiredPaymentCard from "@/components/payments/ExpiredPaymentCard";

// Payment methods config with instructions
const PAYMENT_METHODS = {
  bca: {
    name: "BCA Virtual Account",
    logo: "/banks/bca.png",
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
    logo: "/banks/bni.png",
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
  mandiri: {
    name: "Mandiri Virtual Account",
    logo: "/banks/mandiri.png",
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
  gopay: {
    name: "GoPay",
    logo: "/payment/gopay.png",
    instructions: [
      {
        title: "GoPay",
        steps: [
          "Buka aplikasi Gojek",
          "Scan QR code yang ditampilkan",
          "Konfirmasi detail pembayaran",
          "Masukkan PIN GoPay",
          "Pembayaran selesai",
        ],
      },
    ],
  },
  credit_card: {
    name: "Credit Card",
    logo: "/payment/credit-card.png",
    instructions: [
      {
        title: "Credit Card",
        steps: [
          "Isi detail kartu kredit Anda",
          "Konfirmasi detail pembayaran",
          "Masukkan OTP yang dikirim ke ponsel Anda",
          "Pembayaran selesai",
        ],
      },
    ],
  },
  // Add other payment methods as needed
};

// Function to format time
const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// Main component
interface PaymentInstructionsProps {
  enrollment: any;
  paymentMethod: string;
  courseId: string;
}

export default function PaymentInstructions({
  enrollment,
  paymentMethod,
  courseId,
}: PaymentInstructionsProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(24 * 60 * 60); // 24 hours in seconds
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [paymentDetail, setPaymentDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get payment method details
  const methodConfig = PAYMENT_METHODS[
    paymentMethod as keyof typeof PAYMENT_METHODS
  ] || {
    name: "Payment Method",
    logo: "/payment/generic.png",
    instructions: [{ title: "Instructions", steps: ["Complete your payment"] }],
  };

  // Check payment status
  const { data, refetch } = useQuery({
    queryKey: ["paymentStatus", enrollment.id],
    queryFn: async () => {
      const response = await fetch("/api/check-payment-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enrollmentId: enrollment.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to check payment status");
      }

      return response.json();
    },
    refetchInterval: 10000, // Check every 10 seconds
  });

  // Fetch payment details from API
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/payment-details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            enrollmentId: enrollment.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch payment details");
        }

        const data = await response.json();
        setPaymentDetail(data);
      } catch (err) {
        console.error("Error fetching payment details:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load payment details"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [enrollment.id]);

  // Handle countdown timer
  useEffect(() => {
    if (enrollment.status === "COMPLETED") {
      return;
    }

    // Calculate remaining time if expiryTime exists
    if (paymentDetail?.expiryTime) {
      const expiryTime = new Date(paymentDetail.expiryTime).getTime();
      const now = new Date().getTime();
      const initialSeconds = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setCountdown(initialSeconds);
    }

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
  }, [enrollment.status, paymentDetail?.expiryTime]);

  // Show success dialog when payment completes
  useEffect(() => {
    if (data?.status === "COMPLETED") {
      setSuccessDialogOpen(true);
    }
  }, [data?.status]);

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // Handle payment status UI
  let statusUI;
  if (isLoading) {
    statusUI = (
      <div className="flex items-center text-amber-600">
        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        <span>Memeriksa status pembayaran...</span>
      </div>
    );
  } else if (data?.status === "COMPLETED") {
    statusUI = (
      <div className="flex items-center text-green-600">
        <CheckCircle className="h-5 w-5 mr-2" />
        <span>Pembayaran berhasil!</span>
      </div>
    );
  } else if (data?.status === "FAILED") {
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

  // Check if details are still loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading payment details...</p>
      </div>
    );
  }

  // Show error message if there was a problem loading payment details
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="p-3 rounded-full bg-red-100">
          <X className="h-6 w-6 text-red-600" />
        </div>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  // Handle pending payments - redirect to create new payment
  if (paymentDetail?.isPending) {
    return <PendingPaymentCard enrollment={enrollment} />;
  }

  // Handle expired payments - redirect to create new payment
  if (paymentDetail?.isExpired) {
    return <ExpiredPaymentCard enrollment={enrollment} />;
  }

  // If payment details couldn't be loaded but no error was thrown
  if (!paymentDetail) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="p-3 rounded-full bg-yellow-100">
          <AlertCircle className="h-6 w-6 text-yellow-600" />
        </div>
        <p className="text-muted-foreground">Payment details not available</p>
        <Button
          onClick={() => router.push(`/courses/${courseId}/checkout`)}
          variant="outline"
        >
          Return to Checkout
        </Button>
      </div>
    );
  }

  // Render payment instructions based on method
  const renderInstructions = () => {
    if (!paymentDetail) return null;

    // For virtual accounts
    if (
      paymentDetail.paymentType === "bank_transfer" &&
      ["bca", "bni", "bri", "mandiri", "permata"].includes(paymentMethod)
    ) {
      const vaAccount =
        paymentDetail.vaNumbers?.length > 0 ? paymentDetail.vaNumbers[0] : null;

      return (
        <div className="space-y-6">
          <div className="bg-primary/5 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium mb-2">Nomor Virtual Account</h3>
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="text-2xl font-mono font-semibold tracking-wider">
                {vaAccount?.vaNumber || "-"}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(vaAccount?.vaNumber || "")}
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Bank {methodConfig.name.split(" ")[0]}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Total Pembayaran
              </div>
              <div className="font-semibold">
                {formatPrice(enrollment.amount)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Batas Pembayaran
              </div>
              <div className="text-amber-600 font-medium">
                {formatTime(countdown)}
              </div>
            </div>
          </div>

          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="instructions-0"
          >
            {methodConfig.instructions.map((instruction, idx) => (
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
                        {step.replace("{va_number}", vaAccount?.vaNumber || "")}
                      </li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      );
    }

    // For e-wallets (QR code)
    if (
      ["gopay", "shopeepay", "dana", "ovo"].includes(paymentMethod) &&
      ["gopay", "shopeepay"].includes(paymentDetail.paymentType)
    ) {
      return (
        <div className="space-y-6">
          <div className="bg-primary/5 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium mb-3">Scan QR Code</h3>
            <div className="flex justify-center mb-3">
              <div className="relative h-48 w-48 border">
                <Image
                  src={paymentDetail.qrCodeUrl || "/payment/qr-sample.png"}
                  alt="QR Code"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Scan using {methodConfig.name} app
            </div>

            {paymentDetail.deepLinkUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(paymentDetail.deepLinkUrl, "_blank")}
                className="mt-3"
              >
                Open in App
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Total Pembayaran
              </div>
              <div className="font-semibold">
                {formatPrice(enrollment.amount)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                QR Code berlaku hingga
              </div>
              <div className="text-amber-600 font-medium">
                {formatTime(countdown)}
              </div>
            </div>
          </div>

          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="instructions-0"
          >
            {methodConfig.instructions.map((instruction, idx) => (
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
                        {step}
                      </li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      );
    }

    // For credit card
    if (
      paymentMethod === "credit_card" &&
      paymentDetail.paymentType === "credit_card"
    ) {
      return (
        <div className="space-y-6">
          <div className="bg-primary/5 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4 text-center">
              Pembayaran Kartu Kredit
            </h3>

            {paymentDetail.cardMasked ? (
              <div className="text-center mb-4">
                <p className="text-sm mb-2">Card: {paymentDetail.cardMasked}</p>
                <p className="text-sm text-muted-foreground">
                  Your payment is being processed. Please wait for confirmation.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Redirecting to secure payment page...
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mt-4"></div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground justify-center">
            <div className="relative h-6 w-10">
              <Image
                src={visaLogo}
                alt="Visa"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative h-6 w-10">
              <Image
                src={mastercardLogo}
                alt="Mastercard"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative h-6 w-10">
              <Image
                src={paypalLogo}
                alt="Paypal"
                fill
                className="object-contain"
              />
            </div>
            <div className="relative h-6 w-10">
              <Image src={jcbLogo} alt="JCB" fill className="object-contain" />
            </div>
            <span>Pembayaran aman oleh Midtrans</span>
          </div>
        </div>
      );
    }

    // Default case
    return (
      <div className="text-center p-6">
        <h3 className="text-lg font-medium mb-2">Instruksi Pembayaran</h3>
        <p>Silakan ikuti instruksi untuk menyelesaikan pembayaran Anda.</p>
      </div>
    );
  };

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
                disabled={isLoading}
                title="Refresh payment status"
                className="h-8 w-8 p-0"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              {methodConfig.logo && (
                <div className="h-10 w-14 relative bg-white flex items-center justify-center border rounded p-1">
                  <Image
                    src={methodConfig.logo}
                    alt={methodConfig.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <h2 className="text-xl font-semibold">{methodConfig.name}</h2>
            </div>

            <Separator className="mb-6" />

            {/* Instructions based on payment method */}
            {renderInstructions()}

            {/* Additional help */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-sm font-medium mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Jika Anda menemukan masalah dengan pembayaran Anda, silakan
                hubungi tim dukungan kami.
              </p>
              <Link
                href="/contact"
                className="text-sm text-primary hover:underline flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Hubungi Kami
              </Link>
            </div>
          </Card>
        </div>

        {/* Course Summary - Right Side (3/12) */}
        <div className="md:col-span-3 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Ringkasan Pesanan</h2>

            <div className="relative aspect-video rounded-md overflow-hidden mb-4">
              {enrollment.course?.imageUrl ? (
                <CourseImageCard
                  imageKey={enrollment.course.imageUrl}
                  courseId={enrollment.course.id}
                  courseTitle={enrollment.course.title}
                  className="aspect-video w-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200"></div>
              )}
            </div>

            <h3 className="font-medium mb-2 line-clamp-2">
              {enrollment.course?.title}
            </h3>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Harga kursus</span>
                <span>{formatPrice(enrollment.amount || 0)}</span>
              </div>

              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(enrollment.amount || 0)}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  <span>Menunggu pembayaran Anda</span>
                </div>
                <p>
                  Selesaikan pembayaran Anda dalam:{" "}
                  <span className="font-medium text-amber-600">
                    {formatTime(countdown)}
                  </span>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pembayaran berhasil!</DialogTitle>
            <DialogDescription>
              Pembayaran Anda telah berhasil diproses.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <p className="text-center mb-4">
            Anda sekarang memiliki akses penuh ke{" "}
            <span className="font-medium">{enrollment.course?.title}</span>
          </p>

          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => {
                setSuccessDialogOpen(false);
                router.push(`/courses/${courseId}`);
              }}
            >
              Buka Kursus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

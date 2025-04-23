"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  CreditCard,
  Lock,
  Calendar,
  User2,
  Loader2,
  CheckCircle2,
} from "lucide-react";

// Import payment logos
import visaLogo from "@/assets/international-payment/visa.png";
import mastercardLogo from "@/assets/international-payment/mastercard.png";
import jcbLogo from "@/assets/international-payment/jcb.png";
import paypalLogo from "@/assets/international-payment/paypal.png";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/utils/formatPrice";

const isExpiryDateValid = (value: string) => {
  // Check format (MM/YY)
  if (!/^\d{2}\/\d{2}$/.test(value)) {
    return false;
  }

  const [monthStr, yearStr] = value.split("/");
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10) + 2000; // Convert YY to 20YY

  // Validate month is between 1-12
  if (month < 1 || month > 12) {
    return false;
  }

  // Get current date
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() is 0-indexed
  const currentYear = currentDate.getFullYear();

  // Check if expiry date is in the future
  if (year > currentYear) {
    return true;
  } else if (year === currentYear && month > currentMonth) {
    return true;
  }

  return false;
};

// Form validation schema
const creditCardFormSchema = z.object({
  cardNumber: z
    .string()
    .min(13, { message: "Nomor kartu minimal harus 13 digit" })
    .max(19, { message: "Nomor kartu tidak boleh lebih dari 19 digit" })
    .refine((val) => /^[\d\s]+$/.test(val), {
      message: "Nomor kartu hanya boleh berisi angka dan spasi",
    }),
  cardExpiry: z
    .string()
    .regex(/^\d{2}\/\d{2}$/, { message: "Expiry date must be in format MM/YY" })
    .refine(isExpiryDateValid, {
      message: "Expiry date must be in the future",
    }),
  cardCvv: z
    .string()
    .min(3, { message: "CVV minimal harus 3 digit" })
    .max(4, { message: "CVV tidak boleh lebih dari 4 digit" })
    .refine((val) => /^\d+$/.test(val), {
      message: "CVV hanya boleh berisi angka",
    }),
  cardholderName: z
    .string()
    .min(3, { message: "Nama pemegang kartu minimal harus 3 karakter" }),
});

type CreditCardFormValues = z.infer<typeof creditCardFormSchema>;

interface CreditCardFormProps {
  courseId: string;
  amount: number;
  onSuccess?: (enrollmentId: string) => void;
  onFailure?: (error: string) => void;
  onStatusUpdate?: (status: {
    isProcessingToken: boolean;
    isTokenValid: boolean;
    isProcessingPayment: boolean;
    message?: string;
  }) => void;
}

export default function CreditCardForm({
  courseId,
  amount,
  onSuccess,
  onFailure,
  onStatusUpdate,
}: CreditCardFormProps) {
  const [isProcessingToken, setIsProcessingToken] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cardToken, setCardToken] = useState<string | null>(null);
  const [cardType, setCardType] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [threeDSFrame, setThreeDSFrame] = useState<boolean>(false);

  // Create form
  const form = useForm<CreditCardFormValues>({
    resolver: zodResolver(creditCardFormSchema),
    defaultValues: {
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
      cardholderName: "",
    },
    mode: "onChange", // Validate on change to enable token fetch
  });

  // Format credit card number on input
  const formatCreditCardNumber = (value: string) => {
    // Remove non-digits
    const v = value.replace(/\D/g, "");

    // Apply card type detection
    detectCardType(v);

    // Format with spaces
    const formatted = v.replace(/(\d{4})(?=\d)/g, "$1 ");

    return formatted;
  };

  // Format expiry date on input
  const formatExpiryDate = (value: string) => {
    // Remove non-digits
    const v = value.replace(/\D/g, "");

    // Add slash after MM
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }

    return v;
  };

  // Detect card type based on first digits
  const detectCardType = (cardNumber: string) => {
    const cleanNumber = cardNumber.replace(/\D/g, "");

    if (/^4/.test(cleanNumber)) {
      setCardType("visa");
    } else if (/^5[1-5]/.test(cleanNumber)) {
      setCardType("mastercard");
    } else if (/^3[47]/.test(cleanNumber)) {
      setCardType("amex");
    } else if (/^(62|88)/.test(cleanNumber)) {
      setCardType("unionpay");
    } else if (/^35/.test(cleanNumber)) {
      setCardType("jcb");
    } else {
      setCardType(null);
    }
  };

  // Get card icon based on detected type
  const getCardIcon = () => {
    switch (cardType) {
      case "visa":
        return visaLogo;
      case "mastercard":
        return mastercardLogo;
      case "paypal":
        return paypalLogo;
      case "jcb":
        return jcbLogo;
      default:
        return null;
    }
  };

  // Watch form values for formatting and validation
  const watchCardNumber = form.watch("cardNumber");
  const watchCardExpiry = form.watch("cardExpiry");
  const formState = form.formState;

  // Load Midtrans JS library
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://api.midtrans.com/v2/assets/js/midtrans-new-3ds.min.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Apply formatting on value changes
  useEffect(() => {
    const formatted = formatCreditCardNumber(watchCardNumber);
    if (formatted !== watchCardNumber) {
      form.setValue("cardNumber", formatted, { shouldValidate: true });
    }
  }, [watchCardNumber, form]);

  useEffect(() => {
    const formatted = formatExpiryDate(watchCardExpiry);
    if (formatted !== watchCardExpiry && formatted.length <= 5) {
      form.setValue("cardExpiry", formatted, { shouldValidate: true });
    }
  }, [watchCardExpiry, form]);

  // Handle 3DS redirect
  useEffect(() => {
    if (redirectUrl) {
      setThreeDSFrame(true);
    }
  }, [redirectUrl]);

  // Request token when form becomes valid
  useEffect(() => {
    const getCardToken = async () => {
      // Only proceed if the form is valid and we don't already have a token
      if (
        formState.isValid &&
        !isProcessingToken &&
        !cardToken &&
        Object.keys(formState.errors).length === 0
      ) {
        try {
          setIsProcessingToken(true);
          updateStatus(true, false, false);

          // Parse card expiry
          const expiryParts = form.getValues("cardExpiry").split("/");
          const cardExpMonth = expiryParts[0];
          const cardExpYear = `20${expiryParts[1]}`;

          // Remove spaces from card number
          const cardNumber = form.getValues("cardNumber").replace(/\s+/g, "");

          // Request token from API
          const tokenUrl = `/api/payment/credit-card/token?card_number=${cardNumber}&card_cvv=${form.getValues(
            "cardCvv"
          )}&card_exp_month=${cardExpMonth}&card_exp_year=${cardExpYear}`;

          const response = await fetch(tokenUrl);
          const data = await response.json();

          if (!data.success) {
            throw new Error(data.message || "Gagal mendapatkan token kartu");
          }

          // Store the token
          setCardToken(data.data.token_id);
          updateStatus(false, true, false, "Kartu berhasil divalidasi");
        } catch (error) {
          console.error("Token generation error:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Gagal memvalidasi kartu";
          updateStatus(false, false, false, errorMessage);
          toast.error(errorMessage);

          if (onFailure) {
            onFailure(errorMessage);
          }
        } finally {
          setIsProcessingToken(false);
        }
      }
    };

    getCardToken();
  }, [formState.isValid, formState.errors, cardToken, form, onFailure]);

  // Update parent component about form state
  const updateStatus = (
    isProcessingToken: boolean,
    isTokenValid: boolean,
    isProcessingPayment: boolean,
    message?: string
  ) => {
    if (onStatusUpdate) {
      onStatusUpdate({
        isProcessingToken,
        isTokenValid,
        isProcessingPayment,
        message,
      });
    }
  };

  // Submit handler for payment processing
  const onSubmit = async (values: CreditCardFormValues) => {
    if (!cardToken) {
      toast.error("Kartu belum divalidasi. Silakan coba lagi.");
      return;
    }

    try {
      setIsProcessingPayment(true);
      updateStatus(false, true, true);

      // Generate a unique order ID
      const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Call the charge API
      const response = await fetch("/api/payment/credit-card/charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token_id: cardToken,
          order_id: orderId,
          gross_amount: amount,
          course_id: courseId,
          cardholder_name: values.cardholderName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal memproses pembayaran");
      }

      const data = await response.json();

      // Handle different payment responses
      if (
        data.data.transaction_status === "capture" ||
        data.data.transaction_status === "settlement"
      ) {
        // Handle success
        toast.success("Pembayaran berhasil!");
        if (onSuccess) {
          onSuccess(data.data.order_id);
        }
      }
      // Handle 3DS verification
      else if (data.data.redirect_url) {
        setRedirectUrl(data.data.redirect_url);
        toast.info("Silakan selesaikan verifikasi 3D Secure");
      }
      // Handle pending status
      else if (data.data.transaction_status === "pending") {
        toast.info("Pembayaran sedang diproses");
        if (onSuccess) {
          onSuccess(data.data.order_id);
        }
      }
      // Handle other statuses
      else {
        toast.error(`Status pembayaran: ${data.data.transaction_status}`);
        if (onFailure) {
          onFailure(`Status pembayaran: ${data.data.transaction_status}`);
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Pembayaran gagal";
      toast.error(errorMessage);
      if (onFailure) {
        onFailure(errorMessage);
      }
    } finally {
      setIsProcessingPayment(false);
      updateStatus(false, !!cardToken, false);
    }
  };

  if (threeDSFrame) {
    return (
      <div className="space-y-4">
        <div className="bg-primary/5 p-4 rounded-lg">
          <h3 className="text-center font-medium mb-2">Verifikasi 3D Secure</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Silakan selesaikan proses verifikasi untuk mengamankan pembayaran
            Anda
          </p>
        </div>

        <div className="border rounded-lg overflow-hidden h-[500px]">
          <iframe
            src={redirectUrl || "about:blank"}
            className="w-full h-full"
            title="Verifikasi 3D Secure"
          />
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Pembayaran Kartu Kredit</h2>
        <div className="flex items-center space-x-2">
          <div className="h-full relative w-12">
            <Image
              src={visaLogo}
              alt="Visa"
              width={70}
              height={50}
              className="object-contain"
            />
          </div>
          <div className="h-full relative w-12">
            <Image
              src={mastercardLogo}
              alt="Mastercard"
              width={70}
              height={50}
              className="object-contain"
            />
          </div>
          <div className="h-full relative w-12">
            <Image
              src={paypalLogo}
              alt="Paypal"
              width={70}
              height={50}
              className="object-contain"
            />
          </div>
          <div className="h-full relative w-12">
            <Image
              src={jcbLogo}
              alt="JCB"
              width={70}
              height={50}
              className="object-contain"
            />
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Cardholder Name */}
          <FormField
            control={form.control}
            name="cardholderName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  <User2 className="h-4 w-4" />
                  Nama Pemegang Kartu
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Budi Santoso"
                    {...field}
                    disabled={isProcessingToken || isProcessingPayment}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Card Number */}
          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  Nomor Kartu
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="4811 1111 1111 1114"
                      {...field}
                      maxLength={19}
                      className="pr-10"
                      disabled={isProcessingToken || isProcessingPayment}
                    />
                    {getCardIcon() && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-8">
                        <Image
                          src={getCardIcon()!}
                          alt={cardType!}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Expiry Date and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cardExpiry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Tanggal Kadaluarsa
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="MM/YY"
                      {...field}
                      maxLength={5}
                      disabled={isProcessingToken || isProcessingPayment}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cardCvv"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Lock className="h-4 w-4" />
                    CVV
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123"
                      {...field}
                      type="password"
                      maxLength={4}
                      disabled={isProcessingToken || isProcessingPayment}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Token Status Indicator */}
          {isProcessingToken && (
            <div className="flex items-center text-xs text-blue-600 mt-2">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              <span>Memvalidasi kartu...</span>
            </div>
          )}

          {cardToken && (
            <div className="flex items-center text-xs text-green-600 mt-2">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              <span>Kartu tervalidasi</span>
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
            <Lock className="h-3 w-3" />
            <span>Informasi pembayaran Anda aman dan terenkripsi</span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full mt-2"
            disabled={isProcessingToken || isProcessingPayment || !cardToken}
            size="lg"
          >
            {isProcessingPayment ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                Bayar {formatPrice(amount)}
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
}

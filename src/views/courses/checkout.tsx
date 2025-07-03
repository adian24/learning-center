"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

// Import bank logos and components
import { BankMethodSelector } from "@/sections/courses/detail/checkout/BankMethodSelector";

// Import ewallet logos
import gopayLogo from "@/assets/ewallet/gopay.png";
import shopeepayLogo from "@/assets/ewallet/shopeepay.png";
import danaLogo from "@/assets/ewallet/dana.png";
import ovoLogo from "@/assets/ewallet/ovo.png";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { formatVideoDuration } from "@/utils/formatVideoDuration";
import {
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  CreditCard,
  Landmark,
  Wallet,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { EWalletMethodSelector } from "@/sections/courses/detail/checkout/EWalletMethodSelector";
import { CourseImageCard } from "@/components/media/SecureImage";
import { useTranslations } from "next-intl";

// Payment method types
const paymentMethods = [
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "Bayar dengan virtual account",
    icon: Landmark,
    options: [],
  },
  {
    id: "credit_card",
    name: "Credit Card",
    description: "Visa, Mastercard, JCB",
    icon: CreditCard,
    options: [],
  },
  {
    id: "ewallet",
    name: "E-Wallet",
    description: "GoPay, OVO, DANA, SPay",
    icon: Wallet,
    options: [
      { id: "gopay", name: "GoPay", logo: gopayLogo },
      { id: "shopeepay", name: "ShopeePay", logo: shopeepayLogo },
      { id: "dana", name: "DANA", logo: danaLogo },
      { id: "ovo", name: "OVO", logo: ovoLogo },
    ],
  },
];

// Form validation schema
const checkoutFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

interface CustomCheckoutProps {
  course: any;
  user: any;
  studentProfileId: string;
}

export default function CustomCheckout({
  course,
  user,
  studentProfileId,
}: CustomCheckoutProps) {
  const t = useTranslations("checkout");

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Setup form with default values
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  // Handle payment method category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);

    // If credit card is selected, automatically set the payment method
    if (categoryId === "credit_card") {
      setSelectedMethod("credit_card");
    } else {
      setSelectedMethod(null); // Reset method selection for other categories
    }
  };

  // Handle specific payment method selection
  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  // Submit handler to initiate payment
  const onSubmit = async (values: CheckoutFormValues) => {
    if (!selectedMethod) {
      toast.error(t("payment_method_required"));
      return;
    }

    try {
      setIsSubmitting(true);

      // Save the phone number for OVO if provided
      if (values.phone) {
        localStorage.setItem("userPhoneNumber", values.phone);
      }

      // Handle credit card payment differently
      if (selectedMethod === "credit_card") {
        // Redirect to credit card payment page
        router.push(`/courses/${course.id}/payment/credit-card`);
        return;
      }

      // For e-wallets - handled in EWalletMethodSelector
      if (selectedCategory === "ewallet") {
        // The EWalletMethodSelector will handle the navigation
        return;
      }

      const paymentData = {
        courseId: course.id,
        amount: course.price || 0,
        currency: "IDR",
        paymentMethod: selectedMethod,
      };

      const response = await fetch("/api/midtrans-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to initiate payment");
      }

      const data = await response.json();

      // Redirect to payment page with required parameters
      router.push(
        `/courses/${course.id}/payment?method=${selectedMethod}&enrollment=${data.enrollmentId}`
      );
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to process payment"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Payment Method Selection - Left Side (2/3 on medium screens) */}
      <div className="md:col-span-2 space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {t("payment_method_required")}
          </h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fullname")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("name_placeholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("email_label")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("email_placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("phone_label")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("phone_placeholder")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Payment Method Categories */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {t("payment_method_label")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {paymentMethods.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div
                        key={category.id}
                        className={`p-4 border rounded-md cursor-pointer transition-all ${
                          selectedCategory === category.id
                            ? "border-2 border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-medium">{category.name}</h4>
                            {category.id === "bank_transfer" ? (
                              <div className="flex items-center gap-1">
                                <p className="text-xs text-muted-foreground mr-1">
                                  {t("payment_va")}
                                </p>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Specific Payment Methods */}
              {(() => {
                if (!selectedCategory) return null;

                const selectedPaymentCategory = paymentMethods.find(
                  (c) => c.id === selectedCategory
                );

                // Use our custom BankMethodSelector for bank transfers
                if (selectedCategory === "bank_transfer") {
                  return (
                    <BankMethodSelector
                      courseId={course.id}
                      courseName={course.title}
                      coursePrice={course.price}
                    />
                  );
                }

                // Use our custom EWalletMethodSelector for e-wallets
                if (selectedCategory === "ewallet") {
                  return (
                    <EWalletMethodSelector
                      courseId={course.id}
                      courseName={course.title}
                      coursePrice={course.price}
                    />
                  );
                }

                // Handle credit card selection with notice
                if (selectedCategory === "credit_card") {
                  return (
                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                      <div className="p-3 border-2 border-primary bg-primary/5 rounded-md flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-12 relative">
                            <div className="w-full h-full flex items-center justify-center">
                              <CreditCard className="h-8 w-8 text-primary" />
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-sm">
                              {t("payment_method_cc")}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {t("payment_method")}
                            </p>
                          </div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  );
                }

                // For other payment methods with options, render them as before
                if (!selectedPaymentCategory?.options?.length) return null;

                return (
                  <div className="space-y-4 animate-in fade-in-50 duration-300">
                    <h4 className="font-medium">{t("payment_channels")}</h4>

                    <div className="space-y-2">
                      {selectedPaymentCategory.options.map((method) => (
                        <div
                          key={method.id}
                          className={`p-3 border rounded-md flex items-center justify-between cursor-pointer ${
                            selectedMethod === method.id
                              ? "border-2 border-primary bg-primary/5"
                              : "hover:border-primary/50"
                          }`}
                          onClick={() => handleMethodSelect(method.id)}
                        >
                          <div className="flex items-center gap-3">
                            {method.logo ? (
                              <div className="h-10 w-12 relative">
                                <div className="w-full h-full flex items-center justify-center">
                                  <Image
                                    src={method.logo}
                                    alt={method.name}
                                    fill
                                    className="object-contain p-1"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="h-8 w-12 bg-gray-100 rounded"></div>
                            )}
                            <span className="font-medium text-sm">
                              {method.name}
                            </span>
                          </div>

                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Payment Details */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={
                    isSubmitting ||
                    !selectedMethod ||
                    selectedCategory === "bank_transfer" ||
                    selectedCategory === "ewallet"
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("submitting")}
                    </>
                  ) : (
                    "Lanjutkan Pembayaran"
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground mt-3">
                  {t("terms_notice")}
                </p>
              </div>
            </form>
          </Form>
        </Card>

        {/* Payment Security Notice */}
        <Card className="p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-sm mb-1">
                {t("secure_payment")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("secure_payment_desc")}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Course Summary - Right Side (1/3 on medium screens) */}
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t("payment_summary")}</h2>

          <div className="relative aspect-video rounded-md overflow-hidden mb-4">
            {course?.imageUrl ? (
              <CourseImageCard
                imageKey={course.imageUrl}
                courseId={course.id}
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
              <span>{t("course_price")}</span>
              <span>{formatPrice(course?.price || 0)}</span>
            </div>

            <Separator className="my-3" />

            <div className="flex justify-between font-bold">
              <span>{t("total")}</span>
              <span>{formatPrice(course?.price || 0)}</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium">{t("what_you_get")}</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span>{t("full_lifetime_access")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span>{t("mobile_desktop_access")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span>{t("certificate")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span>
                  {course?.chapters?.length || 0} {t("modules_count")}
                </span>
              </li>
            </ul>
          </div>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            {t("have_questions")}{" "}
            <Link href="/contact" className="underline">
              {t("contact_support")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

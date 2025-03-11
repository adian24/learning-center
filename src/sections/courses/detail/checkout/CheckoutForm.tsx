// src/app/courses/[courseId]/checkout/_components/checkout-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Wallet } from "lucide-react";
import { formatVideoDuration } from "@/utils/formatVideoDuration";
import { formatPrice } from "@/utils/formatPrice";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  paymentMethod: z.enum(["credit_card", "bank_transfer", "e_wallet"]),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
  bankAccount: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CheckoutForm({ course, user }: { course: any; user: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      paymentMethod: "credit_card",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      bankAccount: "",
    },
  });

  const paymentMethod = form.watch("paymentMethod");

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true);

      // TODO: Implement actual payment processing with Flip
      // This is a placeholder for future integration
      console.log("Processing payment", values);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Enrollment successful!");

      // Redirect to course page or confirmation page
      router.push(`/courses/${course.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-3">Metode Pembayaran</h3>

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    className="flex flex-col space-y-3"
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <label
                        htmlFor="credit_card"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <CreditCard className="h-5 w-5" />
                        <span>Kartu Kredit/Debit</span>
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="bank_transfer"
                        id="bank_transfer"
                      />
                      <label
                        htmlFor="bank_transfer"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="8" width="18" height="12" rx="2" />
                          <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
                          <path d="M12 14v.01" />
                        </svg>
                        <span>Bank Transfer</span>
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="e_wallet" id="e_wallet" />
                      <label
                        htmlFor="e_wallet"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Wallet className="h-5 w-5" />
                        <span>E-Wallet</span>
                      </label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {paymentMethod === "credit_card" && (
          <div className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Kartu</FormLabel>
                  <FormControl>
                    <Input placeholder="1234 5678 9012 3456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input placeholder="MM/YY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input placeholder="123" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {paymentMethod === "bank_transfer" && (
          <div className="space-y-4 pt-2">
            <div className="rounded-md border p-4 bg-gray-50">
              <p className="text-sm mb-2">Bank transfer instructions:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>
                  1. Lengkapi formulir pembayaran dan klik "Konfirmasi
                  Pendaftaran"
                </li>
                <li>2. Anda akan menerima rincian rekening bank</li>
                <li>3. Lakukan pembayaran dalam waktu 24 jam</li>
                <li>4. Akses akan diberikan setelah konfirmasi pembayaran</li>
              </ul>
            </div>
          </div>
        )}

        {paymentMethod === "e_wallet" && (
          <div className="space-y-4 pt-2">
            <div className="rounded-md border p-4 bg-gray-50">
              <p className="text-sm mb-2">E-Wallet payment options:</p>
              <p className="text-sm text-muted-foreground">
                Setelah mengklik "Konfirmasi Pendaftaran", Anda akan diarahkan
                untuk memilih penyedia dompet elektronik pilihan Anda.
              </p>
            </div>
          </div>
        )}

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full h-12 text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Memproses..."
              : `Konfirmasi Pembayaran • ${
                  formatPrice(course.price) || "0.00"
                }`}
          </Button>

          <p className="text-xs text-center mt-3 text-muted-foreground">
            Dengan menyelesaikan pembelian Anda, Anda menyetujui ketentuan
            berikut:{" "}
            <a href="/terms" className="underline">
              Ketentuan Layanan
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline">
              Kebijakan Privasi
            </a>
            .
          </p>
        </div>
      </form>
    </Form>
  );
}

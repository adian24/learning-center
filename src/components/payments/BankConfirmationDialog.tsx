"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BankIcon } from "@/components/ui/bank-icons";
import { formatPrice } from "@/utils/formatPrice";
import { Loader2 } from "lucide-react";

interface BankConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseName: string;
  coursePrice: number;
  selectedBank: string;
}

export function BankConfirmationDialog({
  open,
  onOpenChange,
  courseId,
  courseName,
  coursePrice,
  selectedBank,
}: BankConfirmationDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const getBankName = () => {
    switch (selectedBank) {
      case "bca":
        return "BCA Virtual Account";
      case "bni":
        return "BNI Virtual Account";
      case "bri":
        return "BRI Virtual Account";
      case "mandiri":
        return "Mandiri Virtual Account";
      case "permata":
        return "Permata Virtual Account";
      default:
        return "Virtual Account";
    }
  };

  const handleConfirm = () => {
    setIsProcessing(true);

    setTimeout(() => {
      router.push(`/courses/${courseId}/payment/bank?name=${selectedBank}`);
    }, 500);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isProcessing) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
          <DialogDescription>
            Anda akan melakukan pembayaran melalui {getBankName()}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          <BankIcon
            bank={selectedBank}
            size="lg"
            className="mb-4 p-2 border rounded"
          />

          <div className="text-center space-y-2">
            <p className="font-medium">{courseName}</p>
            <p className="text-2xl font-bold">{formatPrice(coursePrice)}</p>
          </div>
        </div>

        <div className="bg-muted/50 p-3 rounded-md text-sm">
          <p>
            Setelah mengklik &quot;Lanjutkan&quot;, Anda akan diarahkan ke
            halaman pembayaran dengan instruksi detail untuk menyelesaikan
            transaksi melalui {getBankName()}.
          </p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="sm:mr-2"
            disabled={isProcessing}
          >
            Batal
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Lanjutkan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

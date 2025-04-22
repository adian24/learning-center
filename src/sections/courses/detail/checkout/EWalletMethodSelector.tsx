import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";

// Import e-wallet logos
import gopayLogo from "@/assets/ewallet/gopay.png";
import shopeepayLogo from "@/assets/ewallet/shopeepay.png";
import danaLogo from "@/assets/ewallet/dana.png";
import ovoLogo from "@/assets/ewallet/ovo.png";

// Dialog for e-wallet confirmation
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EWalletMethodSelectorProps {
  courseId: string;
  courseName?: string;
  coursePrice?: number;
  onSelect?: (method: string) => void;
}

const SUPPORTED_EWALLETS = [
  { id: "gopay", name: "GoPay", logo: gopayLogo },
  { id: "shopeepay", name: "ShopeePay", logo: shopeepayLogo },
  { id: "dana", name: "DANA", logo: danaLogo },
  { id: "ovo", name: "OVO", logo: ovoLogo },
];

export function EWalletMethodSelector({
  courseId,
  courseName = "Course",
  coursePrice = 0,
  onSelect,
}: EWalletMethodSelectorProps) {
  const [selectedEWallet, setSelectedEWallet] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const router = useRouter();

  const handleEWalletSelect = (ewalletId: string) => {
    setSelectedEWallet(ewalletId);

    if (onSelect) {
      onSelect(ewalletId);
    } else {
      // Show confirmation dialog
      setIsConfirmDialogOpen(true);
    }
  };

  const handleConfirmPayment = () => {
    if (!selectedEWallet) {
      toast.error("Please select an e-wallet");
      return;
    }

    // For OVO, we should check if phone number is available
    if (selectedEWallet === "ovo") {
      // This is just a simple check - in a real app, you might want to
      // verify the phone number format or check if it exists in the user profile
      const userPhoneNumber = localStorage.getItem("userPhoneNumber");
      if (!userPhoneNumber) {
        toast.error("Phone number is required for OVO payments");
        // Here you could show a modal to collect the phone number
        return;
      }
    }

    // Navigate to the e-wallet payment page
    router.push(`/courses/${courseId}/payment/ewallet?type=${selectedEWallet}`);
  };

  return (
    <>
      <div className="space-y-4 animate-in fade-in-50 duration-300">
        <h4 className="font-medium">Pilih E-Wallet</h4>

        <div className="space-y-2">
          {SUPPORTED_EWALLETS.map((ewallet) => (
            <div
              key={ewallet.id}
              className={`p-3 border rounded-md flex items-center justify-between cursor-pointer ${
                selectedEWallet === ewallet.id
                  ? "border-2 border-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => handleEWalletSelect(ewallet.id)}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-16 relative bg-white flex items-center justify-center border rounded p-1">
                  <Image
                    src={ewallet.logo}
                    alt={ewallet.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="font-medium text-sm">{ewallet.name}</span>
              </div>

              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pembayaran</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan melakukan pembayaran untuk{" "}
              <span className="font-medium">{courseName}</span> menggunakan{" "}
              {SUPPORTED_EWALLETS.find((e) => e.id === selectedEWallet)?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex items-center justify-center py-4">
            {selectedEWallet && (
              <div className="h-16 w-24 relative bg-white flex items-center justify-center border rounded p-2">
                <Image
                  src={
                    SUPPORTED_EWALLETS.find((e) => e.id === selectedEWallet)
                      ?.logo || SUPPORTED_EWALLETS[0].logo
                  }
                  alt={
                    SUPPORTED_EWALLETS.find((e) => e.id === selectedEWallet)
                      ?.name || SUPPORTED_EWALLETS[0].name
                  }
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPayment}>
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

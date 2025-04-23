import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { BankIcon } from "@/components/ui/bank-icons";
import { BankConfirmationDialog } from "@/components/payments/BankConfirmationDialog";

interface BankMethodSelectorProps {
  courseId: string;
  courseName?: string;
  coursePrice?: number;
  onSelect?: (bank: string) => void;
}

const SUPPORTED_BANKS = [
  { id: "bca", name: "BCA Virtual Account" },
  { id: "bni", name: "BNI Virtual Account" },
  { id: "bri", name: "BRI Virtual Account" },
  { id: "mandiri", name: "Mandiri Virtual Account" },
  { id: "permata", name: "Permata Virtual Account" },
];

export function BankMethodSelector({
  courseId,
  courseName = "Course",
  coursePrice = 0,
  onSelect,
}: BankMethodSelectorProps) {
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleBankSelect = (bankId: string) => {
    setSelectedBank(bankId);

    if (onSelect) {
      onSelect(bankId);
    } else {
      // Show confirmation dialog instead of direct navigation
      setIsConfirmDialogOpen(true);
    }
  };

  return (
    <>
      <div className="space-y-4 animate-in fade-in-50 duration-300">
        <h4 className="font-medium">Pilih Bank</h4>

        <div className="space-y-2">
          {SUPPORTED_BANKS.map((bank) => (
            <div
              key={bank.id}
              className={`p-3 border rounded-md flex items-center justify-between cursor-pointer ${
                selectedBank === bank.id
                  ? "border-2 border-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => handleBankSelect(bank.id)}
            >
              <div className="flex items-center gap-3">
                <BankIcon
                  bank={bank.id}
                  size="sm"
                  className="bg-white p-1 border rounded"
                />
                <span className="font-medium text-sm">{bank.name}</span>
              </div>

              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {selectedBank && (
        <BankConfirmationDialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
          courseId={courseId}
          courseName={courseName}
          coursePrice={coursePrice}
          selectedBank={selectedBank}
        />
      )}
    </>
  );
}

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteQuestion, useQuestion } from "@/hooks/use-quiz-management";
import { Question } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuizDialogStore } from "@/store/use-store-quiz-dialog";

const DeleteQuestionDialog = () => {
  const { mutateAsync, isPending } = useDeleteQuestion();
  const {
    isDeleteQuestionOpen,
    deletingQuestionId,
    closeDeleteQuestionDialog,
  } = useQuizDialogStore();

  const { data: question } = useQuestion(deletingQuestionId || "");

  const handleDelete = async () => {
    if (!question) return;

    try {
      await mutateAsync({ questionId: question.id });
      toast.success("Pertanyaan berhasil dihapus");
      closeDeleteQuestionDialog();
    } catch (error) {
      toast.error("Gagal menghapus pertanyaan");
      console.error("Delete question error:", error);
    }
  };

  return (
    <AlertDialog
      open={isDeleteQuestionOpen}
      onOpenChange={closeDeleteQuestionDialog}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Pertanyaan</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus pertanyaan ini? Tindakan ini tidak
            dapat dibatalkan dan akan menghapus pertanyaan beserta semua pilihan
            jawabannya.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {question && (
          <div className="bg-gray-50 border rounded-lg p-3 my-4">
            <p className="text-sm text-gray-800 font-medium">{question.text}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500">
                {question?.points || 0} poin
              </span>
              {question.options && question.options.length > 0 && (
                <span className="text-xs text-gray-500">
                  • {question.options.length} pilihan jawaban
                </span>
              )}
            </div>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus Pertanyaan
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteQuestionDialog;

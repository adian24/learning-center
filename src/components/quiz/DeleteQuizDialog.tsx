"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useDeleteQuiz } from "@/hooks/use-quiz-management";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Quiz } from "@/lib/types";
import { useQuizDialogStore } from "@/stores/use-store-quiz-dialog";

interface DeleteQuizDialogProps {
  quiz: Quiz | null;
}

const DeleteQuizDialog: React.FC<DeleteQuizDialogProps> = ({ quiz }) => {
  const { isDeleteOpen, closeDeleteDialog } = useQuizDialogStore();
  const [confirmText, setConfirmText] = useState("");
  const deleteQuizMutation = useDeleteQuiz();

  const handleDelete = async () => {
    if (!quiz) return;

    try {
      await deleteQuizMutation.mutateAsync(quiz.id);

      toast.success("Quiz Berhasil Dihapus", {
        description: `Quiz "${quiz.title}" telah berhasil dihapus.`,
      });

      closeDeleteDialog();
      setConfirmText("");
    } catch (error: any) {
      toast.error("Gagal Menghapus Quiz", {
        description: error.message || "Terjadi kesalahan saat menghapus quiz.",
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmText("");
      closeDeleteDialog();
    }
  };

  const isLoading = deleteQuizMutation.isPending;
  const hasQuestions = quiz?.questions && quiz.questions.length > 0;
  const isConfirmValid = confirmText === "HAPUS";

  if (!quiz) return null;

  return (
    <Dialog open={isDeleteOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Hapus Quiz
          </DialogTitle>
          <DialogDescription>
            Tindakan ini tidak dapat dibatalkan. Quiz dan semua data terkait
            akan dihapus permanen.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quiz Info */}
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Judul Quiz:</span>
                <p className="text-sm text-gray-700">{quiz.title}</p>
              </div>
              {quiz.description && (
                <div>
                  <span className="text-sm font-medium">Deskripsi:</span>
                  <p className="text-sm text-gray-700">{quiz.description}</p>
                </div>
              )}
              <div className="flex gap-4 text-sm">
                <span>
                  <span className="font-medium">Passing Score:</span>{" "}
                  {quiz.passingScore}%
                </span>
                {quiz.timeLimit && (
                  <span>
                    <span className="font-medium">Waktu:</span> {quiz.timeLimit}{" "}
                    menit
                  </span>
                )}
              </div>
              <div>
                <span className="text-sm font-medium">Jumlah Soal:</span>{" "}
                <span className="text-sm">
                  {quiz.questions?.length || 0} soal
                </span>
              </div>
            </div>
          </div>

          {/* Warning Alert */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="space-y-2">
                <p className="font-medium">Data yang akan dihapus:</p>
                <ul className="text-sm space-y-1">
                  <li>• Quiz dan semua pengaturannya</li>
                  {hasQuestions && (
                    <li>
                      • {quiz.questions?.length} pertanyaan dan pilihan jawaban
                    </li>
                  )}
                  <li>• Riwayat attempt siswa (jika ada)</li>
                  <li>• Progress siswa yang terkait dengan quiz ini</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Confirmation */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <span className="font-medium">Konfirmasi:</span> Ketik "
              <span className="font-mono font-bold">HAPUS</span>" untuk
              melanjutkan penghapusan.
            </p>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Ketik HAPUS untuk konfirmasi"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmValid || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Hapus Quiz
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteQuizDialog;

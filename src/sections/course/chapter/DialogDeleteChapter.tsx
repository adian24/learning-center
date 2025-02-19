"use client";

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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteChapterStore } from "@/store/use-store-delete-chapter";

export function DialogDeleteChapter() {
  const queryClient = useQueryClient();

  const { isOpen, chapterToDelete, isDeleting, onClose, setIsDeleting, reset } =
    useDeleteChapterStore();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const response = await fetch(
        `/api/teacher/courses/${chapterToDelete?.courseId}/chapters/${chapterToDelete?.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete chapter");
      }

      toast.success("Chapter deleted successfully");

      // Revalidate chapters data
      queryClient.invalidateQueries({
        queryKey: ["chapters"],
      });

      reset();
    } catch (error) {
      console.error("[DELETE_CHAPTER_ERROR]", error);
      toast.error("Failed to delete chapter");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Chapter?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span>
              Kamu akan menghapus chapter{" "}
              <span className="font-bold text-black">
                {chapterToDelete?.title}
              </span>{" "}
              .
            </span>
            <br />
            <br />
            <span className="text-red-500">
              Tindakan ini tidak dapat dibatalkan. Semua data dan progres
              Student untuk chapter ini akan dihapus secara permanen.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menghapus...
              </>
            ) : (
              <>Hapus Chapter</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

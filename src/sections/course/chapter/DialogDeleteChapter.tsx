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
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function DialogDeleteChapter() {
  const t = useTranslations("chapters");

  const queryClient = useQueryClient();
  const router = useRouter();

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
        throw new Error(t("toast_delete_error"));
      }

      toast.success(t("toast_delete_success"));

      // Revalidate chapters data
      queryClient.invalidateQueries({
        queryKey: ["chapters"],
      });

      router.push(`/teacher/courses/${chapterToDelete?.courseId}/chapters`);

      reset();
    } catch (error) {
      console.error("[DELETE_CHAPTER_ERROR]", error);
      toast.error(t("toast_delete_error"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("delete_chapter_title")}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span>
              {t("delete_chapter_confirm")}{" "}
              <span className="font-bold text-black">
                {chapterToDelete?.title}
              </span>{" "}
              .
            </span>
            <br />
            <br />
            <span className="text-red-500">{t("delete_chapter_warning")}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("cancel")}
          </AlertDialogCancel>
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
                {t("deleting")}
              </>
            ) : (
              <>{t("delete")}</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

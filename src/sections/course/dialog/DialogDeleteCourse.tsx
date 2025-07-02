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
import { useDeleteCourseStore } from "@/store/use-store-delete-course";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export function DialogDeleteCourse() {
  const t = useTranslations("teacher_delete_course");

  const queryClient = useQueryClient();
  const router = useRouter();

  const { isOpen, courseToDelete, isDeleting, onClose, setIsDeleting, reset } =
    useDeleteCourseStore();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/courses/${courseToDelete?.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        toast.error(t("toast_error"));
      }

      // Show success message
      toast.success(t("toast_success"));

      // Revalidate courses data
      queryClient.invalidateQueries({
        queryKey: ["teacher-courses"],
      });

      reset();
      router.push("/teacher/courses");
    } catch (error) {
      console.error("[DELETE_COURSE_ERROR]", error);
      toast.error(t("toast_error"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("button_delete")}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span>
              {t.rich("dialog_description_1", {
                title: courseToDelete?.title || "",
                strong: (chunks) => (
                  <span className="font-bold text-black">{chunks}</span>
                ),
              })}
            </span>
            <br />
            <span className="text-red-500">{t("dialog_description_2")}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("button_cancel")}
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
                {t("button_deleting")}
              </>
            ) : (
              <>{t("back")}</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

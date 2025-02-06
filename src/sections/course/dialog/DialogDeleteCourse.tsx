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
import { useDeleteCourseStore } from "@/store/use-delete-course-store";
import { useRouter } from "next/navigation";

export function DialogDeleteCourse() {
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
        toast.error("Failed to delete course");
      }

      // Show success message
      toast.success("Course deleted successfully");

      // Revalidate courses data
      queryClient.invalidateQueries({
        queryKey: ["courses"],
      });

      reset();
      router.push("/teacher/courses");
    } catch (error) {
      console.error("[DELETE_COURSE_ERROR]", error);
      toast.error("Failed to delete course");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Course?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span>
              Kamu akan menghapus{" "}
              <span className="font-bold text-black">
                "{courseToDelete?.title}".
              </span>{" "}
            </span>
            <br />
            <span className="text-red-500">
              Tindakan ini tidak dapat dibatalkan. Semua Chapter, data, dan
              progres Student akan dihapus secara permanen.
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
              <>Hapus Course</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

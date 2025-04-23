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
import { useDeleteVideoStore } from "@/store/use-store delete-video";

const DialogDeleteVideo = () => {
  const queryClient = useQueryClient();

  const { isOpen, videoToDelete, isDeleting, onClose, setIsDeleting } =
    useDeleteVideoStore();

  const handleDelete = async () => {
    if (!videoToDelete) return;

    setIsDeleting(true);

    try {
      // Call the delete API
      const response = await fetch(
        `/api/teacher/courses/${videoToDelete.courseId}/chapters/${videoToDelete.id}/upload`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result?.message);
      } else {
        // await deleteVideo(videoToDelete.id);
        queryClient.invalidateQueries({
          queryKey: ["chapter", videoToDelete.courseId, videoToDelete.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["chapters", videoToDelete.courseId],
        });
        toast.success("Video deleted successfully");
        onClose();
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Video</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span>Apakah Anda yakin akan menghapus video ini?</span>
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
              <>Hapus</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DialogDeleteVideo;

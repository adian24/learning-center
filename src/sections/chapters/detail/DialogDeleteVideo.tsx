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
import { extractVideoPath } from "@/utils/formatVideoDuration";

const DialogDeleteVideo = () => {
  const queryClient = useQueryClient();

  const { isOpen, videoToDelete, isDeleting, onClose, setIsDeleting } =
    useDeleteVideoStore();

  const handleDelete = async () => {
    if (!videoToDelete) return;

    setIsDeleting(true);

    try {
      // 1. First get the chapter details to get the videoKey
      const getChapterResponse = await fetch(
        `/api/teacher/courses/${videoToDelete.courseId}/chapters/${videoToDelete.id}`
      );

      if (!getChapterResponse.ok) {
        throw new Error("Failed to get chapter information");
      }

      const chapterData = await getChapterResponse.json();
      
      // Check if chapter has a video URL
      if (!chapterData.videoUrl) {
        throw new Error("Chapter has no video to delete");
      }
      
      console.log("Video URL to delete:", chapterData.videoUrl);
      const videoKey = extractVideoPath(chapterData.videoUrl);
      console.log("Extracted video key:", videoKey);

      if (!videoKey) {
        throw new Error(`Unable to extract video path from URL: ${chapterData.videoUrl}`);
      }

      // 2. Delete the file from S3
      const deleteResponse = await fetch(
        `/api/upload/video?key=${encodeURIComponent(videoKey)}`,
        {
          method: "DELETE",
        }
      );

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete video from storage");
      }

      // 3. Update the chapter to remove video reference
      const updateResponse = await fetch(
        `/api/teacher/courses/${videoToDelete.courseId}/chapters/${videoToDelete.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoUrl: null,
            duration: null,
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to update chapter data");
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["chapter", videoToDelete.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["chapters", videoToDelete.courseId],
      });

      toast.success("Video deleted successfully");
      onClose();
    } catch (error) {
      console.error("Delete error:", error);
      
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
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

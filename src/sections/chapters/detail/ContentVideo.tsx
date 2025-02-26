"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Chapter } from "@/lib/types";
import { useDeleteVideoStore } from "@/store/use-store delete-video";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, Upload, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ContentVideoProps {
  chapter: Chapter | undefined;
  initialVideo?: string | undefined;
  onUploadComplete?: (url: string) => void;
  onDelete?: () => void;
  isTeacher?: boolean;
  chapterId: string;
  courseId: string;
}

const ContentVideo = ({
  chapter,
  initialVideo,
  courseId,
  chapterId,
}: ContentVideoProps) => {
  const queryClient = useQueryClient();

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(initialVideo);
  const [error, setError] = useState<string>("");

  const onOpenDeleteDialog = useDeleteVideoStore((state) => state.onOpen);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.includes("video")) {
      setError("Please upload a video file");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      // 100MB limit
      setError("Video must be less than 100MB");
      return;
    }

    try {
      setIsUploading(true);
      setError("");

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 500);

      // TODO: Replace with your actual upload logic
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(
        `/api/teacher/courses/${courseId}/chapters/${chapterId}/upload`,
        { method: "POST", body: formData }
      );
      const data = await response.json();

      if (response.ok) {
        clearInterval(interval);
        setUploadProgress(100);
        setVideoUrl(data?.url);
        toast.success("Video uploaded successfully");
        queryClient.invalidateQueries({
          queryKey: ["chapter", chapter?.courseId, chapter?.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["chapters", chapter?.courseId],
        });
      }
    } catch (error) {
      setError("Failed to upload video. Please try again.");
      setIsUploading(false);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    onOpenDeleteDialog(chapter);
  };

  // Empty State - No Video
  if (!chapter?.videoUrl && !isUploading) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-full bg-gray-100">
              <Video className="w-8 h-8 text-gray-500" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Tidak ada video yang diunggah</h3>
              <p className="text-sm text-gray-500">
                Unggah video untuk mulai mengajarkan Chapter ini
              </p>
            </div>
            <div>
              <label className="cursor-pointer">
                <Button
                  className="text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  onClick={() => {
                    document.getElementById("video-upload")?.click();
                  }}
                >
                  <Upload className="w-4 h-4" />
                  Upload Video
                </Button>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleUpload}
                />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Uploading State
  if (isUploading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-center text-sm text-gray-500">
              Mengunggah video... {uploadProgress}%
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex items-center justify-end">
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
            Hapus Video
          </Button>
        </div>
        <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
          <video
            src={chapter?.videoUrl || videoUrl}
            controls
            className="w-full h-full"
            // poster="/api/placeholder/640/360"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentVideo;

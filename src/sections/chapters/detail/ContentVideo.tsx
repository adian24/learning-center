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
import SecureVideo from "@/components/media/SecureVideo";

interface ContentVideoProps {
  chapter: Chapter | undefined;
  initialVideoKey?: string | undefined;
  onUploadComplete?: (key: string) => void;
  onDelete?: () => void;
  isTeacher?: boolean;
  chapterId: string;
  courseId: string;
}

const ContentVideo = ({
  chapter,
  initialVideoKey,
  courseId,
  chapterId,
}: ContentVideoProps) => {
  const queryClient = useQueryClient();

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [videoKey, setVideoKey] = useState<string | undefined>(initialVideoKey);
  const [error, setError] = useState<string>("");

  const onOpenDeleteDialog = useDeleteVideoStore((state) => state.onOpen);

  // Helper function to get video duration
  const getVideoDuration = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };

      video.onerror = (e) => {
        reject(e);
      };

      video.src = URL.createObjectURL(file);
    });
  };

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

      // Start progress indicator
      setUploadProgress(10);

      // 1. Get the presigned URL from our API
      const presignedUrlResponse = await fetch("/api/upload/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!presignedUrlResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { presignedUrl, key } = await presignedUrlResponse.json();

      setUploadProgress(20);

      // 2. Upload the file directly to S3 using the presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload to storage");
      }

      setUploadProgress(70);

      // 3. Get video duration
      const duration = await getVideoDuration(file);

      setUploadProgress(80);

      // 4. Update chapter in database with the new video key and duration
      const updateResponse = await fetch(
        `/api/teacher/courses/${courseId}/chapters/${chapterId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            videoUrl: key, // Store only the key, not full URL
            duration: Math.round(duration),
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to update chapter data");
      }

      setUploadProgress(100);
      setVideoKey(key);
      toast.success("Video uploaded successfully");

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ["chapter", courseId, chapterId],
      });
      queryClient.invalidateQueries({
        queryKey: ["chapters", courseId],
      });
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload video. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDelete = async () => {
    onOpenDeleteDialog(chapter);
  };

  // Empty State - No Video
  if (!chapter?.videoUrl && !videoKey && !isUploading) {
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
                  <Upload className="w-4 h-4 mr-2" />
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
              {uploadProgress < 70
                ? "Mengunggah video..."
                : uploadProgress < 90
                ? "Memproses video..."
                : "Menyelesaikan..."}{" "}
              {uploadProgress}%
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Video is available
  const currentVideoKey = chapter?.videoUrl || videoKey;

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
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus Video
          </Button>
        </div>

        <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
          <SecureVideo
            videoKey={currentVideoKey}
            chapterId={chapterId}
            className="w-full h-full"
            controls={true}
            onError={(error) => {
              console.error("Video playback error:", error);
              setError("Failed to load video");
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentVideo;

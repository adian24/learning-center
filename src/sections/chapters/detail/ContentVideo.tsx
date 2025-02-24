"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, Video } from "lucide-react";
import { useState } from "react";

interface ContentVideoProps {
  initialVideo?: string | undefined;
  onUploadComplete?: (url: string) => void;
  onDelete?: () => void;
  isTeacher?: boolean;
}

const ContentVideo = ({ initialVideo, isTeacher }: ContentVideoProps) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(initialVideo);
  const [error, setError] = useState<string>("");

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
  };

  const handleDelete = async () => {
    try {
      setVideoUrl("");
      //   onDelete?.();
    } catch (error) {
      setError("Failed to delete video");
    }
  };

  // Empty State - No Video
  if (!videoUrl && !isUploading) {
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
              Uploading video... {uploadProgress}%
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
        <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
          <video
            src={videoUrl}
            controls
            className="w-full h-full"
            poster="/api/placeholder/640/360"
          />
        </div>

        {/* Video Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Uploaded video</span>
            <span className="text-sm font-medium">chapter-video.mp4</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentVideo;

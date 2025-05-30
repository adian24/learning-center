"use client";

import { useSecureVideo } from "@/hooks/use-secure-media";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, VideoOff, Loader2, RefreshCw } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SecureVideoProps {
  videoKey: string | null | undefined;
  chapterId: string | null | undefined;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  resumeTime?: number; // Time in seconds to resume from
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onLoadedMetadata?: (duration: number) => void;
  onError?: (error: string) => void;
}

export default function SecureVideo({
  videoKey,
  chapterId,
  className = "w-full aspect-video",
  controls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  resumeTime = 0,
  onPlay,
  onPause,
  onTimeUpdate,
  onLoadedMetadata,
  onError,
}: SecureVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [hasSetInitialTime, setHasSetInitialTime] = useState(false);

  const { videoUrl, chapterTitle, isLoading, error, refetch, isExpired } =
    useSecureVideo(videoKey, chapterId, !!(videoKey && chapterId));

  // Handle video events
  const handlePlay = () => {
    setIsPlaying(true);
    onPlay?.();
  };

  const handlePause = () => {
    setIsPlaying(false);
    onPause?.();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate?.(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      onLoadedMetadata?.(videoRef.current.duration);

      // Set initial time if resumeTime is provided and we haven't set it yet
      if (resumeTime > 0 && !hasSetInitialTime) {
        videoRef.current.currentTime = resumeTime;
        setHasSetInitialTime(true);
      }
    }
  };

  const handleVideoError = () => {
    const errorMessage = "Video failed to play";
    setVideoError(errorMessage);
    onError?.(errorMessage);
  };

  // Auto-refresh expired URLs
  useEffect(() => {
    if (isExpired && videoRef.current) {
      // Pause video when URL expires
      videoRef.current.pause();
      refetch();
    }
  }, [isExpired, refetch]);

  // Update video source when URL changes
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      const currentTime = videoRef.current.currentTime;
      videoRef.current.src = videoUrl;

      // Restore playback position, but prioritize resumeTime for initial load
      if (hasSetInitialTime) {
        videoRef.current.currentTime = currentTime;
      }

      setVideoError(null);
    }
  }, [videoUrl, hasSetInitialTime]);

  // Reset hasSetInitialTime when chapter changes
  useEffect(() => {
    setHasSetInitialTime(false);
  }, [chapterId]);

  // Show loading state
  if (isLoading && videoKey && chapterId) {
    return (
      <div
        className={`bg-black rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
          <p className="text-sm">Loading video...</p>
          {chapterTitle && (
            <p className="text-xs opacity-75 mt-1">{chapterTitle}</p>
          )}
        </div>
      </div>
    );
  }

  // Show error state
  if (error || videoError || (!videoUrl && videoKey && chapterId)) {
    const errorMessage = error?.message || videoError || "Video unavailable";

    return (
      <div className={`bg-gray-900 rounded-lg ${className}`}>
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>{errorMessage}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show empty state when no video key provided
  if (!videoKey) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center text-gray-500">
          <VideoOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No video available</p>
          <p className="text-sm opacity-75">
            This chapter doesn&apos;t have a video yet
          </p>
        </div>
      </div>
    );
  }

  // Render video player
  return (
    <div
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
    >
      {videoUrl ? (
        <>
          <video
            ref={videoRef}
            src={videoUrl}
            controls={controls}
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            className="w-full h-full"
            onPlay={handlePlay}
            onPause={handlePause}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={handleVideoError}
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>

          {/* Show refresh overlay when URL is expired */}
          {isExpired && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="text-center text-white">
                <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <p className="text-sm">Refreshing video...</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Skeleton className="w-full h-full" />
        </div>
      )}
    </div>
  );
}

// Specialized video player for chapter content
export function ChapterVideoPlayer({
  videoKey,
  chapterId,
  chapterTitle,
  resumeTime = 0,
  onProgressUpdate,
  className = "w-full aspect-video",
}: {
  videoKey: string | null | undefined;
  chapterId: string | null | undefined;
  chapterTitle?: string;
  resumeTime?: number;
  onProgressUpdate?: (watchedSeconds: number, isCompleted: boolean) => void;
  className?: string;
}) {
  const [lastReportedTime, setLastReportedTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  const handleTimeUpdate = (currentTime: number) => {
    // Report progress every 10 seconds to avoid too many API calls
    if (
      Math.floor(currentTime) % 10 === 0 &&
      Math.floor(currentTime) !== lastReportedTime
    ) {
      setLastReportedTime(Math.floor(currentTime));

      // Consider video completed if watched 90% or more
      const isCompleted =
        videoDuration > 0 && currentTime >= videoDuration * 0.9;

      onProgressUpdate?.(Math.floor(currentTime), isCompleted);
    }
  };

  const handleLoadedMetadata = (duration: number) => {
    setVideoDuration(duration);
  };

  return (
    <SecureVideo
      videoKey={videoKey}
      chapterId={chapterId}
      className={className}
      resumeTime={resumeTime}
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      controls={true}
    />
  );
}

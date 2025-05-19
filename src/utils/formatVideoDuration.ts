import { uploadLargeFile } from "@/lib/services/s3/upload-file";

export function formatVideoDuration(durationInSeconds: number): string {
  // Round to nearest second
  const totalSeconds = Math.round(durationInSeconds);

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format with leading zeros as needed
  const formattedSeconds = seconds.toString().padStart(2, "0");

  if (hours > 0) {
    // Format: HH:MM:SS (e.g., "1:05:30")
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  } else if (minutes > 0) {
    // Format: MM:SS (e.g., "5:30")
    return `${minutes}:${formattedSeconds}`;
  } else {
    // Format: 0:SS (e.g., "0:45")
    return `0:${formattedSeconds}`;
  }
}

export async function getVideoDuration(file: File) {
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
}

export async function uploadVideoWithDuration(file: File, fileName: string) {
  try {
    // Get duration first
    const duration = await getVideoDuration(file);

    // Upload file
    const fileUrl = await uploadLargeFile(file, fileName);

    // Return both URL and duration
    return {
      url: fileUrl,
      duration: duration,
    };
  } catch (error) {
    console.error("Error uploading video:", error);
    throw error;
  }
}

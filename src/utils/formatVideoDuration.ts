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

export function extractVideoPath(url: string): string | null {
  try {
    // If it's already a key (not a full URL), return it directly
    if (url.startsWith('videos/')) {
      return url;
    }
    
    // Try to parse as URL
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;

    // Handle different URL patterns
    const match = pathname.match(/videos\/.+$/);
    if (match) {
      return match[0];
    }

    // If no match found, try to extract from query parameters
    const searchParams = parsedUrl.searchParams;
    const key = searchParams.get('key');
    if (key && key.startsWith('videos/')) {
      return key;
    }

    return null;
  } catch (error) {
    // If URL parsing fails, check if it's already a valid key
    if (typeof url === 'string' && url.startsWith('videos/')) {
      return url;
    }
    
    console.error("Invalid URL:", error);
    return null;
  }
}

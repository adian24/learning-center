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

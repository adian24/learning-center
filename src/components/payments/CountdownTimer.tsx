"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  expiryTime: string | Date; // ISO string or Date object
  onExpire?: () => void;
  className?: string;
  expiredMessage?: string;
  showIcon?: boolean;
  labelText?: string;
}

export function CountdownTimer({
  expiryTime,
  onExpire,
  className = "",
  expiredMessage = "Expired",
  showIcon = true,
  labelText,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
  });

  const calculateTimeLeft = useCallback(() => {
    const expiryDate =
      typeof expiryTime === "string" ? new Date(expiryTime) : expiryTime;

    const now = new Date();
    const difference = expiryDate.getTime() - now.getTime();

    if (difference <= 0) {
      // Time has expired
      if (onExpire) onExpire();
      return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
    }

    // Calculate remaining time
    const totalSeconds = Math.floor(difference / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { hours, minutes, seconds, totalSeconds };
  }, [expiryTime, onExpire]);

  useEffect(() => {
    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Set up timer
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Clear interval if expired
      if (newTimeLeft.totalSeconds <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    // Clean up
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  // Format the time as HH:MM:SS
  const formattedTime = `${timeLeft.hours
    .toString()
    .padStart(2, "0")}:${timeLeft.minutes
    .toString()
    .padStart(2, "0")}:${timeLeft.seconds.toString().padStart(2, "0")}`;

  // Determine text color based on remaining time
  const getColorClass = () => {
    if (timeLeft.totalSeconds === 0) return "text-red-600";
    if (timeLeft.totalSeconds < 3600) return "text-red-600"; // Less than 1 hour
    if (timeLeft.totalSeconds < 7200) return "text-amber-600"; // Less than 2 hours
    return "text-amber-600";
  };

  const colorClass = getColorClass();

  return (
    <div className={`flex items-center ${className}`}>
      {labelText && (
        <span className="text-muted-foreground mr-2">{labelText}</span>
      )}

      {showIcon && timeLeft.totalSeconds > 0 && (
        <Clock className={`h-4 w-4 mr-1 ${colorClass}`} />
      )}

      <span className={`font-medium ${colorClass}`}>
        {timeLeft.totalSeconds > 0 ? formattedTime : expiredMessage}
      </span>
    </div>
  );
}

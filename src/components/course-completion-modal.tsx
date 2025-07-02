"use client";

import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Download,
  Share2,
  Star,
  Award,
  CheckCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface CourseCompletionData {
  id: string;
  title: string;
  instructor: string;
  category: string;
  level: string;
  completionDate: string;
  certificateUrl?: string;
  certificateNumber?: string;
}

interface CourseCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseData: CourseCompletionData;
  onViewCertificate: () => void;
  onShareAchievement: () => void;
  onDownloadCertificate: () => void;
}

export function CourseCompletionModal({
  isOpen,
  onClose,
  courseData,
  onViewCertificate,
  onShareAchievement,
  onDownloadCertificate,
}: CourseCompletionModalProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      onShareAchievement();
      toast.success("Achievement shared successfully!");
    } catch (error) {
      toast.error("Failed to share achievement");
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      onDownloadCertificate();
      toast.success("Certificate downloaded!");
    } catch (error) {
      toast.error("Failed to download certificate");
    } finally {
      setIsDownloading(false);
    }
  };

  const getGradientByLevel = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "from-green-400 to-blue-500";
      case "intermediate":
        return "from-yellow-400 to-orange-500";
      case "advanced":
        return "from-purple-400 to-pink-500";
      default:
        return "from-blue-400 to-purple-500";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Header with celebration background */}
        <div
          className={`bg-gradient-to-r ${getGradientByLevel(
            courseData.level
          )} p-8 text-white relative overflow-hidden`}
        >
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 opacity-20">
            <Sparkles className="h-12 w-12" />
          </div>
          <div className="absolute bottom-4 left-4 opacity-20">
            <Trophy className="h-16 w-16" />
          </div>

          <div className="relative z-10 text-center">
            <div className="mb-4">
              <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">🎉 Congratulations!</h2>
              <p className="text-lg opacity-90">
                You&apos;ve completed the course
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Course Info Card */}
          <Card className="border-0 bg-gray-50">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {courseData.title}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700"
                    >
                      {courseData.category}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      {courseData.level}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <p className="font-medium">Instructor</p>
                    <p>{courseData.instructor}</p>
                  </div>
                  <div>
                    <p className="font-medium">Completed on</p>
                    <p>
                      {new Date(courseData.completionDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certificate Section */}
          {courseData.certificateUrl && (
            <Card className="border-2 border-yellow-200 bg-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      Your Certificate is Ready!
                    </h4>
                    <p className="text-sm text-gray-600">
                      Certificate ID: {courseData.certificateNumber}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Achievement Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Star className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-900">
                Course Mastered
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-900">
                Achievement Unlocked
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-purple-900">
                Certificate Earned
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onViewCertificate}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Award className="h-4 w-4 mr-2" />
              View Certificate
            </Button>

            <Button
              onClick={handleDownload}
              disabled={isDownloading || !courseData.certificateUrl}
              variant="outline"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {isDownloading ? "Downloading..." : "Download PDF"}
            </Button>

            <Button
              onClick={handleShare}
              disabled={isSharing}
              variant="outline"
              className="flex-1"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {isSharing ? "Sharing..." : "Share Achievement"}
            </Button>
          </div>

          {/* Next Steps */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">
              What&apos;s Next?
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>Add this certificate to your LinkedIn profile</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span>Explore advanced courses in {courseData.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                <span>Share your achievement with friends and colleagues</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook return type
interface UseCourseCompletionDetectionReturn {
  showModal: boolean;
  completionData: CourseCompletionData | null;
  handleCourseCompletion: (data: CourseCompletionData) => void;
  handleDownloadCertificate: () => Promise<void>;
  handleShareAchievement: () => Promise<void>;
  handleViewCertificate: () => void;
  closeModal: () => void;
}

// Hook for course completion detection
export function useCourseCompletionDetection(
  courseId: string
): UseCourseCompletionDetectionReturn {
  const [completionData, setCompletionData] =
    useState<CourseCompletionData | null>(null);
  const [showModal, setShowModal] = useState(false);

  // This would be called from your progress tracking hook
  const handleCourseCompletion = (data: CourseCompletionData) => {
    setCompletionData(data);
    setShowModal(true);
  };

  const handleDownloadCertificate = async () => {
    if (!completionData?.certificateUrl) return;

    // Create download link
    const link = document.createElement("a");
    link.href = completionData.certificateUrl;
    link.download = `certificate_${completionData.certificateNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareAchievement = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Course Completion Achievement",
        text: `I just completed "${completionData?.title}" course!`,
        url: window.location.href,
      });
    } else {
      // Fallback to copying to clipboard
      const shareText = `🎉 I just completed "${completionData?.title}" course! Certificate ID: ${completionData?.certificateNumber}`;
      await navigator.clipboard.writeText(shareText);
    }
  };

  const handleViewCertificate = () => {
    if (completionData?.certificateUrl) {
      window.open(completionData.certificateUrl, "_blank");
    }
  };

  return {
    showModal,
    completionData,
    handleCourseCompletion,
    handleDownloadCertificate,
    handleShareAchievement,
    handleViewCertificate,
    closeModal: () => setShowModal(false),
  };
}

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileX,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Award,
} from "lucide-react";
import { toast } from "sonner";

interface RegenerateCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  courseId: string;
  onSuccess?: (certificateData: any) => void;
}

export function RegenerateCertificateModal({
  isOpen,
  onClose,
  courseTitle,
  courseId,
  onSuccess,
}: RegenerateCertificateModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<"initial" | "generating" | "success" | "error">("initial");
  const [errorMessage, setErrorMessage] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStep("generating");
    setErrorMessage("");

    try {
      // First, trigger certificate generation
      const generateResponse = await fetch(`/api/courses/${courseId}/generate-certificate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || "Failed to generate certificate");
      }

      const generateResult = await generateResponse.json();
      
      // Show success state
      setStep("success");
      toast.success("Certificate generated successfully!");

      // Call success callback if provided
      if (onSuccess && generateResult.certificate) {
        onSuccess(generateResult.certificate);
      }

      // Auto close after success
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error) {
      console.error("Failed to generate certificate:", error);
      setStep("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to generate certificate");
      toast.error("Failed to generate certificate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setStep("initial");
    setErrorMessage("");
    setIsGenerating(false);
    onClose();
  };

  const renderContent = () => {
    switch (step) {
      case "generating":
        return (
          <div className="text-center space-y-4 py-6">
            <div className="flex justify-center">
              <div className="relative">
                <Award className="h-16 w-16 text-blue-500 animate-pulse" />
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin absolute -bottom-1 -right-1" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Generating Your Certificate</h3>
              <p className="text-muted-foreground">
                Please wait while we create your certificate...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "70%" }}></div>
              </div>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center space-y-4 py-6">
            <div className="flex justify-center">
              <div className="relative">
                <Award className="h-16 w-16 text-green-500" />
                <CheckCircle className="h-6 w-6 text-green-600 absolute -bottom-1 -right-1 bg-white rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-green-700">Certificate Generated!</h3>
              <p className="text-muted-foreground">
                Your certificate has been successfully generated and is now available.
              </p>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
            <div className="text-center py-4">
              <FileX className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Generation Failed</h3>
              <p className="text-muted-foreground">
                We couldn&apos;t generate your certificate. Please try again.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="text-center py-4">
              <FileX className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Certificate Not Found</h3>
              <p className="text-muted-foreground">
                Your certificate for <strong>&ldquo;{courseTitle}&rdquo;</strong> could not be found. 
                This might happen if the certificate generation process was interrupted.
              </p>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Don&apos;t worry! You can generate a new certificate since you&apos;ve successfully completed the course.
              </AlertDescription>
            </Alert>
          </div>
        );
    }
  };

  const renderFooter = () => {
    switch (step) {
      case "generating":
        return (
          <Button disabled className="w-full">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Certificate...
          </Button>
        );

      case "success":
        return (
          <Button onClick={handleClose} className="w-full bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Great!
          </Button>
        );

      case "error":
        return (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleGenerate} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        );

      default:
        return (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Certificate
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            Certificate Generation
          </DialogTitle>
          <DialogDescription>
            {step === "initial" && "Generate your course completion certificate"}
            {step === "generating" && "Creating your certificate..."}
            {step === "success" && "Certificate ready!"}
            {step === "error" && "Certificate generation failed"}
          </DialogDescription>
        </DialogHeader>
        
        {renderContent()}
        
        <DialogFooter>
          {renderFooter()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
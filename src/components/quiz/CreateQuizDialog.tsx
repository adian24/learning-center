"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCreateQuiz } from "@/hooks/use-quiz-management";
import { Plus, Loader2, Clock, Trophy } from "lucide-react";

interface CreateQuizDialogProps {
  chapterId: string;
  disabled?: boolean;
  maxQuizzesReached?: boolean;
}

interface QuizFormData {
  title: string;
  description: string;
  timeLimit: number | null;
  passingScore: number;
}

interface QuizFormErrors {
  title?: string;
  description?: string;
  timeLimit?: string;
  passingScore?: string;
}

const CreateQuizDialog: React.FC<CreateQuizDialogProps> = ({
  chapterId,
  disabled = false,
  maxQuizzesReached = false,
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<QuizFormData>({
    title: "",
    description: "",
    timeLimit: null,
    passingScore: 60,
  });
  const [errors, setErrors] = useState<QuizFormErrors>({});

  const createQuizMutation = useCreateQuiz();

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      timeLimit: null,
      passingScore: 60,
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: QuizFormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Judul quiz wajib diisi";
    }

    if (formData.passingScore < 1 || formData.passingScore > 100) {
      newErrors.passingScore = "Passing score harus antara 1-100";
    }

    if (formData.timeLimit !== null && formData.timeLimit < 1) {
      newErrors.timeLimit = "Batas waktu minimal 1 menit";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const quizData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        timeLimit: formData.timeLimit || undefined,
        passingScore: formData.passingScore,
        chapterId,
      };

      await createQuizMutation.mutateAsync(quizData);

      toast.success("Quiz Berhasil Dibuat", {
        description: `Quiz "${formData.title}" telah berhasil dibuat.`,
      });

      resetForm();
      setOpen(false);
    } catch (error: any) {
      toast.error("Gagal Membuat Quiz", {
        description: error.message || "Terjadi kesalahan saat membuat quiz.",
      });
    }
  };

  const handleInputChange = (
    field: keyof QuizFormData,
    value: string | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field as keyof QuizFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const isLoading = createQuizMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled || maxQuizzesReached} className="gap-2">
          <Plus className="h-4 w-4" />
          Buat Quiz Baru
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Buat Quiz Baru
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quiz Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Judul Quiz <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Masukkan judul quiz..."
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              disabled={isLoading}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Quiz Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi Quiz</Label>
            <Textarea
              id="description"
              placeholder="Deskripsi singkat tentang quiz ini..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isLoading}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Time Limit and Passing Score */}
          <div className="grid grid-cols-2 gap-4">
            {/* Time Limit */}
            <div className="space-y-2">
              <Label htmlFor="timeLimit" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Batas Waktu
              </Label>
              <Select
                value={formData.timeLimit?.toString() || "unlimited"}
                onValueChange={(value) =>
                  handleInputChange(
                    "timeLimit",
                    value === "unlimited" ? null : parseInt(value)
                  )
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih batas waktu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unlimited">Tanpa Batas</SelectItem>
                  <SelectItem value="5">5 menit</SelectItem>
                  <SelectItem value="10">10 menit</SelectItem>
                  <SelectItem value="15">15 menit</SelectItem>
                  <SelectItem value="30">30 menit</SelectItem>
                  <SelectItem value="45">45 menit</SelectItem>
                  <SelectItem value="60">60 menit</SelectItem>
                  <SelectItem value="90">90 menit</SelectItem>
                  <SelectItem value="120">120 menit</SelectItem>
                </SelectContent>
              </Select>
              {errors.timeLimit && (
                <p className="text-sm text-red-500">{errors.timeLimit}</p>
              )}
            </div>

            {/* Passing Score */}
            <div className="space-y-2">
              <Label htmlFor="passingScore" className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                Passing Score (%)
              </Label>
              <Input
                id="passingScore"
                type="number"
                min="1"
                max="100"
                placeholder="60"
                value={formData.passingScore}
                onChange={(e) =>
                  handleInputChange(
                    "passingScore",
                    parseInt(e.target.value) || 0
                  )
                }
                disabled={isLoading}
                className={errors.passingScore ? "border-red-500" : ""}
              />
              {errors.passingScore && (
                <p className="text-sm text-red-500">{errors.passingScore}</p>
              )}
            </div>
          </div>

          {/* Form Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Informasi:</p>
              <ul className="space-y-1 text-xs">
                <li>• Quiz akan dibuat dalam status draft</li>
                <li>• Anda dapat menambahkan pertanyaan setelah quiz dibuat</li>
                <li>• Maksimal 30 quiz per chapter</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Membuat...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Buat Quiz
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateQuizDialog;

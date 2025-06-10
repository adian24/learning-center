"use client";

import React, { useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useUpdateQuiz } from "@/hooks/use-quiz-management";
import { Edit, Loader2, Clock, Trophy } from "lucide-react";
import { Quiz } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useQuizDialogStore } from "@/store/use-store-quiz-dialog";

interface EditQuizDialogProps {
  quiz: Quiz | null;
}

const formSchema = z.object({
  title: z.string().min(1, "Judul quiz wajib diisi"),
  description: z.string().optional(),
  timeLimit: z.number().nullable(),
  passingScore: z.number().min(1, "Minimal 1").max(100, "Maksimal 100"),
});

type FormData = z.infer<typeof formSchema>;

const EditQuizDialog: React.FC<EditQuizDialogProps> = ({ quiz }) => {
  const { isEditOpen, closeEditDialog } = useQuizDialogStore();
  const updateQuizMutation = useUpdateQuiz();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      timeLimit: null,
      passingScore: 60,
    },
  });

  // Reset form when dialog opens and we have quiz data
  useEffect(() => {
    if (isEditOpen && quiz) {
      form.reset({
        title: quiz.title || "",
        description: quiz.description || "",
        timeLimit: quiz.timeLimit || null,
        passingScore: quiz.passingScore || 60,
      });
    }
  }, [isEditOpen, quiz, form]);

  const onSubmit = async (data: FormData) => {
    if (!quiz) return;

    try {
      const updateData = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        timeLimit: data.timeLimit || undefined,
        passingScore: data.passingScore,
      };

      await updateQuizMutation.mutateAsync({
        quizId: quiz.id,
        data: updateData,
      });

      toast.success("Quiz Berhasil Diperbarui", {
        description: `Quiz "${data.title}" telah berhasil diperbarui.`,
      });

      closeEditDialog();
    } catch (error: any) {
      toast.error("Gagal Memperbarui Quiz", {
        description:
          error.message || "Terjadi kesalahan saat memperbarui quiz.",
      });
    }
  };

  const handleCancel = useCallback(() => {
    if (quiz) {
      form.reset({
        title: quiz.title || "",
        description: quiz.description || "",
        timeLimit: quiz.timeLimit || null,
        passingScore: quiz.passingScore || 60,
      });
    }
    closeEditDialog();
  }, [form, quiz, closeEditDialog]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        // Only reset if form is dirty (has changes)
        if (form.formState.isDirty && quiz) {
          form.reset({
            title: quiz.title || "",
            description: quiz.description || "",
            timeLimit: quiz.timeLimit || null,
            passingScore: quiz.passingScore || 60,
          });
        }
        closeEditDialog();
      }
    },
    [form, quiz, closeEditDialog]
  );

  const isLoading = updateQuizMutation.isPending;

  if (!quiz) return null;

  return (
    <Dialog open={isEditOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[500px]"
        onInteractOutside={(e) => {
          // Prevent dialog from closing when interacting with Select dropdown
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Quiz
          </DialogTitle>
          <DialogDescription>
            Edit quiz ini. Perubahan akan mempengaruhi semua siswa yang
            mengerjakan quiz.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Quiz Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Judul Quiz <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan judul quiz..."
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Quiz Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi Quiz</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Deskripsi singkat tentang quiz ini..."
                      disabled={isLoading}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time Limit and Passing Score */}
            <div className="grid grid-cols-2 gap-4">
              {/* Time Limit */}
              <FormField
                control={form.control}
                name="timeLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Batas Waktu
                    </FormLabel>
                    <Select
                      value={field.value?.toString() || "unlimited"}
                      onValueChange={(value) =>
                        field.onChange(
                          value === "unlimited" ? null : parseInt(value)
                        )
                      }
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih batas waktu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent
                        // Prevent Select from closing the dialog
                        onCloseAutoFocus={(e) => e.preventDefault()}
                      >
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Passing Score */}
              <FormField
                control={form.control}
                name="passingScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      Passing Score (%)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="60"
                        disabled={isLoading}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">⚠️ Perhatian:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Perubahan pada quiz akan mempengaruhi semua siswa</li>
                  <li>
                    • Jika siswa sedang mengerjakan, mereka akan menggunakan
                    setting lama
                  </li>
                  <li>
                    • Passing score baru akan berlaku untuk attempt selanjutnya
                  </li>
                </ul>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memperbarui...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4" />
                    Perbarui Quiz
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditQuizDialog;

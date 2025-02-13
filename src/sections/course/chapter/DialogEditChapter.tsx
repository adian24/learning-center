"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEditChapterStore } from "@/store/use-store-edit-chapter";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ChapterFormValues {
  title: string;
  description?: string;
  isFree: boolean;
}

const DialogEditChapter = () => {
  const queryClient = useQueryClient();

  const { isOpen, chapterToEdit, isEditing, onClose, setIsEditing, reset } =
    useEditChapterStore();

  const form = useForm<ChapterFormValues>({
    defaultValues: {
      title: chapterToEdit?.title || "",
      description: chapterToEdit?.description || "",
      isFree: chapterToEdit?.isFree || false,
    },
  });

  // Reset form when chapter changes
  React.useEffect(() => {
    if (chapterToEdit) {
      form.reset({
        title: chapterToEdit.title.replace(/^Chapter \d+ : /, ""), // Remove chapter prefix
        description: chapterToEdit?.description || "",
        isFree: chapterToEdit?.isFree,
      });
    }
  }, [chapterToEdit, form]);

  const editChapter = useMutation({
    mutationFn: async (values: ChapterFormValues) => {
      setIsEditing(true);
      const response = await fetch(
        `/api/teacher/courses/${chapterToEdit?.courseId}/chapters/${chapterToEdit?.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update chapter");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      toast.success("Chapter updated successfully");
      reset();
      form.reset();
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Failed to update chapter");
      setIsEditing(false);
    },
  });

  const onSubmit = async (values: ChapterFormValues) => {
    // Preserve the original chapter number
    const chapterNumber = chapterToEdit?.title.match(/^Chapter (\d+) :/)?.[0] || "";
    await editChapter.mutateAsync({
      ...values,
      title: chapterNumber + values.title,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>Edit Chapter</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Title wajib diisi" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Masukan Title"
                      startContent={chapterToEdit?.title.match(/^Chapter \d+ :/)?.[0] || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tulis deskripsi dari chapter ini"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFree"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Chapter Gratis</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700"
                disabled={isEditing}
              >
                {isEditing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogEditChapter;
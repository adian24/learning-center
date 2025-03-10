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
import { useCreateChapterStore } from "@/store/use-store-create-chapter";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

const DialogCreateChapter = () => {
  const queryClient = useQueryClient();

  const { isOpen, chapterToCreate, isCreating, onClose, setIsCreating, reset } =
    useCreateChapterStore();

  const form = useForm<ChapterFormValues>({
    defaultValues: {
      title: "",
      description: "",
      isFree: false,
    },
  });

  const { data: chapters } = useQuery({
    queryKey: ["chapters", chapterToCreate?.courseId],
    queryFn: async () => {
      const response = await fetch(
        `/api/teacher/courses/${chapterToCreate?.courseId}/chapters`
      );
      if (!response.ok) throw new Error("Failed to fetch chapters");
      return response.json();
    },
  });

  const createChapter = useMutation({
    mutationFn: async (values: ChapterFormValues) => {
      setIsCreating(true);
      const response = await fetch(
        `/api/teacher/courses/${chapterToCreate?.courseId}/chapters?page=1&limit=3`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create chapter");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      toast.success("Chapter created successfully");
      reset();
      form.reset();
      setIsCreating(false);
    },
    onError: () => {
      toast.error("Failed to create chapter");
      setIsCreating(false);
    },
  });

  const onSubmit = async (values: ChapterFormValues) => {
    const prefix = `Chapter ${chapters?.metadata?.totalChapters + 1} : `;
    await createChapter.mutateAsync({
      ...values,
      title: prefix + " " + values.title,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[750px]">
        <DialogHeader>
          <DialogTitle>Buat Chapter Baru</DialogTitle>
          <DialogDescription>
            Buat Chapter untuk Course <b>{chapterToCreate?.courseTitle}</b>
          </DialogDescription>
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
                      startContent={`Chapter ${
                        chapters?.metadata?.totalChapters + 1
                      } : `}
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
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Membuat...
                  </>
                ) : (
                  "Buat Chapter"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCreateChapter;

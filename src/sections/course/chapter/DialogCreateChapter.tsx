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
import { useTranslations } from "next-intl";

interface ChapterFormValues {
  title: string;
  description?: string;
  isFree: boolean;
}

const DialogCreateChapter = () => {
  const t = useTranslations("chapters");

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
      if (!response.ok) throw new Error(t("fetch_error"));
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
        throw new Error(t("toast_create_error"));
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      toast.success(t("toast_create_success"));
      reset();
      form.reset();
      setIsCreating(false);
    },
    onError: () => {
      toast.error(t("toast_create_error"));
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
          <DialogTitle>{t("create_chapter_title")}</DialogTitle>
          <DialogDescription>
            {t("create_chapter_description", {
              title: chapterToCreate?.courseTitle ?? "",
            })}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: t("form_title_required") }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form_title_label")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("form_title_placeholder")}
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
                  <FormLabel>{t("form_description_label")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("form_description_placeholder")}
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
                    <FormLabel>{t("form_is_free_label")}</FormLabel>
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
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("creating")}
                  </>
                ) : (
                  <>{t("create")}</>
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

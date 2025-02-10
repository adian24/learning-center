"use client";

import React, { useEffect } from "react";

import { useSettingChapterStore } from "@/store/use-store-setting-chapter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface ChapterFormValues {
  prefix: string;
  title: string;
  description: string;
  videoUrl: string;
  isFree: boolean;
  isPublished: boolean;
}

const DialogSettingChapter = () => {
  const queryClient = useQueryClient();

  const { isOpen, chapterToUpdate, isUpdating, onClose, setIsUpdating, reset } =
    useSettingChapterStore();

  const { data: chapter } = useQuery({
    queryKey: ["chapter", chapterToUpdate?.chapterId],
    queryFn: async () => {
      const response = await fetch(
        `/api/teacher/courses/${chapterToUpdate?.courseId}/chapters/${chapterToUpdate?.chapterId}`
      );
      if (!response.ok) throw new Error("Failed to fetch chapters");
      return response.json();
    },
  });

  const form = useForm<ChapterFormValues>({
    defaultValues: {
      prefix: "",
      title: "",
      description: "",
      videoUrl: "",
      isFree: false,
      isPublished: false,
    },
  });

  useEffect(() => {
    if (chapter) {
      const splitIndex = chapter.title.indexOf(": ") + 2;
      const prefix = chapter.title.slice(0, splitIndex);
      const title = chapter.title.slice(splitIndex);

      form.reset({
        prefix,
        title,
        description: chapter.description || "",
        videoUrl: chapter.videoUrl || "",
        isFree: chapter.isFree,
        isPublished: chapter.isPublished,
      });
    }
  }, [chapter, form]);

  const onSubmit = (values: ChapterFormValues) => {
    // updateChapter.mutate(values);
  };

  console.log("CHAPTER : ", chapter);

  return (
    <Dialog open={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chapter Settings</DialogTitle>
          <DialogDescription>
            Atur semua kebutuhan untuk Chapter, tambahkan sumber pendukung
            seperti File, Link atau Pdf. Cantumkan juga link video pembelajaran.
            <br />
            <br />
            Course : <b>{chapter?.course?.title}</b>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter chapter title"
                      startContent={form.getValues("prefix")}
                      {...field}
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
                      placeholder="Enter chapter description"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter video URL"
                      type="url"
                      //   value={field?.value ?? ""}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="isFree"
                render={({ field }) => (
                  <FormItem className="flex-1 flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Free Chapter</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex-1 flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Published</FormLabel>
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSettingChapter;

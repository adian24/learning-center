"use client";

import React, { useEffect, useState } from "react";

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
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormBasicSettingChapter from "./FormBasicSettingChapter";
import FormResourcesSettingChapter from "./FormResourcesSettingChapter";

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

  const [activeTab, setActiveTab] = useState("basic");

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

        <Tabs
          defaultValue="basic"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormBasicSettingChapter form={form} />
              </form>
            </Form>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <FormResourcesSettingChapter />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSettingChapter;

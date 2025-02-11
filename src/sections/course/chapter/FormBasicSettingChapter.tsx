import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { UseFormReturn } from "react-hook-form";

interface ChapterFormValues {
  prefix: string;
  title: string;
  description: string;
  videoUrl: string;
  isFree: boolean;
  isPublished: boolean;
}

interface FormBasicSettingChapterProps {
  form: UseFormReturn<ChapterFormValues>;
}

const FormBasicSettingChapter = ({ form }: FormBasicSettingChapterProps) => {
  return (
    <>
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
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
};

export default FormBasicSettingChapter;

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
import { useTranslations } from "next-intl";
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
  const t = useTranslations("chapters");

  return (
    <>
      <FormField
        control={form.control}
        name="title"
        rules={{ required: t("form_basic_title_required") }}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("form_basic_title_label")}</FormLabel>
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
            <FormLabel>{t("form_basic_description_label")}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("form_basic_description_placeholder")}
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
            <FormLabel>{t("form_basic_video_label")}</FormLabel>
            <FormControl>
              <Input
                placeholder={t("form_basic_video_placeholder")}
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
                <FormLabel>{t("form_basic_is_free_label")}</FormLabel>
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
              <FormLabel>{t("form_basic_is_published_label")}</FormLabel>
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

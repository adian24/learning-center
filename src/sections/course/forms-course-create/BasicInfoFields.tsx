import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { CourseFormValues } from "@/lib/validations/courses";
import { useTranslations } from "next-intl";

interface BasicInfoFieldsProps {
  form: UseFormReturn<CourseFormValues>;
  isSubmitting: boolean;
  categories?: Array<{ id: string; name: string }>;
}

export const BasicInfoFieldsCreate = ({
  form,
  isSubmitting,
  categories,
}: BasicInfoFieldsProps) => {
  const t = useTranslations("courses");
  const tCommon = useTranslations("common");

  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("form_title_label")}</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder={t("form_title_placeholder")}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormDescription>{t("form_title_description")}</FormDescription>
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
                {...field}
                placeholder={t("form_description_placeholder")}
                rows={5}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form_level_label")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form_level_placeholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="BEGINNER">
                    {tCommon("level_beginner")}
                  </SelectItem>
                  <SelectItem value="INTERMEDIATE">
                    {tCommon("level_intermediate")}
                  </SelectItem>
                  <SelectItem value="ADVANCED">
                    {tCommon("level_advanced")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form_category_label")}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("form_category_placeholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("form_price_label")}</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="number"
                min="0"
                step="0.01"
                placeholder={t("form_price_placeholder")}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

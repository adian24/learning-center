"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useResourcesStore } from "@/store/use-store-resources";
import { Save, X } from "lucide-react";
import TiptapEditor from "./TipTapEditor";
import { useCreateResource } from "@/hooks/use-resources";

const createResourceSchema = z.object({
  title: z
    .string()
    .min(1, "Judul tidak boleh kosong")
    .max(255, "Judul terlalu panjang"),
  content: z.string().min(1, "Konten tidak boleh kosong"),
  summary: z.string().optional(),
});

type CreateResourceForm = z.infer<typeof createResourceSchema>;

const DrawerCreateResource: React.FC = () => {
  const { isCreateOpen, closeCreateDialog, chapterId } = useResourcesStore();

  const { mutate: createResource, isPending } = useCreateResource();

  const form = useForm<CreateResourceForm>({
    resolver: zodResolver(createResourceSchema),
    defaultValues: {
      title: "",
      content: "",
      summary: "",
    },
  });

  const onSubmit = (data: CreateResourceForm) => {
    const readTime = calculateReadTime(data.content);

    createResource({
      ...data,
      chapterId: chapterId || "",
      readTime: readTime || 1,
    });

    handleClose();
  };

  const handleClose = () => {
    form.reset();
    closeCreateDialog();
  };

  const calculateReadTime = (content: string) => {
    // Remove HTML tags and calculate reading time
    const text = content.replace(/<[^>]*>/g, "");
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const readTime = Math.ceil(words.length / 200); // 200 words per minute
    return readTime > 0 ? readTime : 1;
  };

  return (
    <Drawer open={isCreateOpen} onOpenChange={(open) => !open && handleClose()}>
      <DrawerContent className="h-screen max-w-2xl ml-auto w-full p-0">
        <DrawerHeader>
          <DrawerTitle>Create New Resource</DrawerTitle>
          <DrawerDescription>
            Create a comprehensive learning resource with rich text content
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <Form {...form}>
            <form className="space-y-6">
              {/* Basic Information */}
              <div>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judul</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan judul resource..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Summary */}
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ringkasan Artikel (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ringkasan singkat dari konten resource..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Rich Text Editor */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konten</FormLabel>
                    <FormControl>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <TiptapEditor
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Mulai menulis konten resource Anda..."
                          className="p-0"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === "development" && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Debug Info:</p>
                  <p className="text-xs text-gray-500">
                    Estimasi waktu baca:{" "}
                    {calculateReadTime(form.watch("content") || "")} menit
                  </p>
                </div>
              )}
            </form>
          </Form>
        </div>

        <DrawerFooter className="px-4">
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Membuat...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Buat Resource
                </>
              )}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" onClick={handleClose}>
                <X className="w-4 w-4 mr-2" />
                Batal
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerCreateResource;

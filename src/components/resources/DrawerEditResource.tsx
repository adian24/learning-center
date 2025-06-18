import { useResource, useUpdateResource } from "@/hooks/use-resources";
import { useResourcesStore } from "@/store/use-store-resources";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import TiptapEditor from "./TipTapEditor";
import { Button } from "../ui/button";
import { Save, X } from "lucide-react";

const resourceSchema = z.object({
  title: z
    .string()
    .min(1, "Judul tidak boleh kosong")
    .max(255, "Judul terlalu panjang"),
  content: z.string().min(1, "Konten tidak boleh kosong"),
  summary: z.string().optional(),
});

type ResourceForm = z.infer<typeof resourceSchema>;

const DrawerEditResource = () => {
  const { isEditOpen, editingResourceId, closeEditDialog } =
    useResourcesStore();
  const { data: existingResource } = useResource(
    editingResourceId || undefined
  );
  const { mutate: updateResource, isPending } = useUpdateResource();

  const form = useForm<ResourceForm>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: existingResource?.title,
      content: existingResource?.content,
      summary: existingResource?.summary || "",
    },
  });

  // Update form when editing and data is loaded
  React.useEffect(() => {
    if (isEditOpen && existingResource) {
      form.reset({
        title: existingResource.title,
        content: existingResource.content,
        summary: existingResource.summary || "",
      });
    } else if (!isEditOpen) {
      form.reset({
        title: "",
        content: "",
        summary: "",
      });
    }
  }, [isEditOpen, existingResource, form]);

  const calculateReadTime = (content: string) => {
    // Remove HTML tags and calculate reading time
    const text = content.replace(/<[^>]*>/g, "");
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const readTime = Math.ceil(words.length / 200); // 200 words per minute
    return readTime > 0 ? readTime : 1;
  };

  const handleClose = () => {
    form.reset({
      title: "",
      content: "",
      summary: "",
    });
    closeEditDialog();
  };

  const onSubmit = (data: ResourceForm) => {
    const readTime = calculateReadTime(data.content);

    updateResource({
      resourceId: editingResourceId || "",
      data: {
        ...data,
        readTime: readTime || 1,
      },
    });

    handleClose();
  };

  return (
    <Drawer open={isEditOpen} onOpenChange={(open) => !open && handleClose()}>
      <DrawerContent className="h-screen max-w-2xl ml-auto w-full p-0">
        <DrawerHeader>
          <DrawerTitle>Edit Resource</DrawerTitle>
          <DrawerDescription>
            Edit sumber belajar yang komprehensif dengan konten teks yang
            variatif
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
                  MEngubah...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Edit Resource
                </>
              )}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" onClick={handleClose}>
                <X className="mr-2" />
                Batal
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerEditResource;

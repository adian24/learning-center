"use client";

import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import ListItem from "@tiptap/extension-list-item";
import { Link } from "@tiptap/extension-link";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import { Separator } from "@/components/ui/separator";
import { useResourcesStore } from "@/store/use-store-resources";
import { CreateResourceRequest } from "@/lib/types/resource";
import {
  Bold,
  Italic,
  Underline,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Palette,
  Highlighter,
  Type,
  Save,
  X,
} from "lucide-react";

const createResourceSchema = z.object({
  title: z
    .string()
    .min(1, "Judul tidak boleh kosong")
    .max(255, "Judul terlalu panjang"),
  content: z.string().min(1, "Konten tidak boleh kosong"),
  summary: z.string().optional(),
});

type CreateResourceForm = z.infer<typeof createResourceSchema>;

interface MenuBarProps {
  editor: any;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  return (
    <div className="border-b border-gray-200 p-2">
      <div className="flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1">
          <Button
            variant={editor.isActive("bold") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive("italic") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive("underline") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive("code") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Headings */}
        <div className="flex gap-1">
          <Button
            variant={
              editor.isActive("heading", { level: 1 }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant={
              editor.isActive("heading", { level: 2 }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant={
              editor.isActive("heading", { level: 3 }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Lists */}
        <div className="flex gap-1">
          <Button
            variant={editor.isActive("bulletList") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive("orderedList") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive("blockquote") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Alignment */}
        <div className="flex gap-1">
          <Button
            variant={
              editor.isActive({ textAlign: "left" }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={
              editor.isActive({ textAlign: "center" }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={
              editor.isActive({ textAlign: "right" }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant={
              editor.isActive({ textAlign: "justify" }) ? "default" : "ghost"
            }
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Media & Links */}
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={addLink}>
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Colors */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setColor("#000000")}
            className="text-black"
          >
            <Type className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setColor("#dc2626")}
            className="text-red-600"
          >
            <Palette className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setColor("#2563eb")}
            className="text-blue-600"
          >
            <Palette className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive("highlight") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <Highlighter className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const DrawerCreateResource: React.FC = () => {
  const { isCreateOpen, closeCreateDialog, chapterId } = useResourcesStore();
  const queryClient = useQueryClient();

  const lowlight = createLowlight(common);

  const form = useForm<CreateResourceForm>({
    resolver: zodResolver(createResourceSchema),
    defaultValues: {
      title: "",
      content: "",
      summary: "",
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      form.setValue("content", editor.getHTML());
    },
  });

  const createResourceMutation = useMutation({
    mutationFn: async (data: CreateResourceRequest) => {
      const response = await fetch("/api/teacher/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create resource");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Resource created successfully!");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create resource");
    },
  });

  const onSubmit = (data: CreateResourceForm) => {
    const readTime = calculateReadTime();

    createResourceMutation.mutate({
      ...data,
      chapterId: chapterId || "",
      readTime: readTime || 0,
    });
  };

  const handleClose = () => {
    form.reset();
    editor?.commands.setContent("");
    closeCreateDialog();
  };

  const calculateReadTime = () => {
    if (!editor) return;

    const text = editor.getText();
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    const readTime = Math.ceil(words.length / 200); // 200 words per minute

    return readTime > 0 ? readTime : undefined;
  };

  return (
    <Drawer open={isCreateOpen} onOpenChange={(open) => !open && handleClose()}>
      <DrawerContent className="h-screen max-w-xl ml-auto w-full p-0">
        <DrawerHeader>
          <DrawerTitle>Create New Resource</DrawerTitle>
          <DrawerDescription>
            Create a comprehensive learning resource with rich text content
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <MenuBar editor={editor} />
                        <EditorContent
                          editor={editor}
                          className="prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DrawerFooter className="px-4">
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={createResourceMutation.isPending}
              className="flex-1"
            >
              {createResourceMutation.isPending ? (
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
                <X className="w-4 h-4 mr-2" />
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

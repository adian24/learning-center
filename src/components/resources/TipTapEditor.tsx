// TipTapEditor.tsx
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Redo,
  Underline,
  Undo,
} from "lucide-react";

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size={"sm"}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`text-xs font-medium rounded border transition-colors ${
            editor.isActive("heading", { level: 1 })
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size={"sm"}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`text-xs font-medium rounded border transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size={"sm"}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`text-xs font-medium rounded border transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size={"sm"}
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`text-xs font-medium rounded border transition-colors ${
            editor.isActive("paragraph")
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          Paragraph
        </Button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <Button
          type="button"
          size={"sm"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`text-xs font-bold rounded border transition-colors ${
            editor.isActive("bold")
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size={"sm"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`text-xs rounded border transition-colors ${
            editor.isActive("italic")
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size={"sm"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`text-xs rounded border transition-colors ${
            editor.isActive("underline")
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size={"sm"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`text-xs line-through rounded border transition-colors ${
            editor.isActive("strike")
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          Strike
        </Button>
        <Button
          type="button"
          size={"sm"}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`text-xs border transition-colors ${
            editor.isActive("highlight")
              ? "bg-yellow-400 text-black border-yellow-400"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          Highlight
        </Button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <Button
          type="button"
          size={"sm"}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`text-xs border transition-colors ${
            editor.isActive({ textAlign: "left" })
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size={"sm"}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`text-xs border transition-colors ${
            editor.isActive({ textAlign: "center" })
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size={"sm"}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`text-xs border transition-colors ${
            editor.isActive({ textAlign: "right" })
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size={"sm"}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`text-xs border transition-colors ${
            editor.isActive({ textAlign: "justify" })
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className={`text-xs border transition-colors ${
              editor.isActive("undo")
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className={`text-xs border transition-colors ${
              editor.isActive("redo")
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface TiptapEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  value = "",
  onChange,
  placeholder = "Mulai menulis...",
  className = "",
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value || `<p>${placeholder}</p>`,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || `<p>${placeholder}</p>`);
    }
  }, [value, editor, placeholder]);

  return (
    <div className={`max-w-4xl mx-auto p-3 ${className}`}>
      <MenuBar editor={editor} />
      <EditorContent
        editor={editor}
        className="
          min-h-[300px] 
          p-4 
          border 
          border-gray-300 
          rounded-lg 
          focus-within:border-blue-500 
          focus-within:ring-2 
          focus-within:ring-blue-200
          
          [&_.tiptap]:outline-none
          [&_.tiptap]:prose
          [&_.tiptap]:max-w-none
          
          /* First child margin reset */
          [&_.tiptap_*:first-child]:mt-0
          
          /* List styles */
          [&_.tiptap_ul]:px-4
          [&_.tiptap_ol]:px-4
          [&_.tiptap_ul]:my-5
          [&_.tiptap_ol]:my-5
          [&_.tiptap_ul]:mr-4
          [&_.tiptap_ol]:mr-4
          [&_.tiptap_ul]:ml-1.5
          [&_.tiptap_ol]:ml-1.5
          [&_.tiptap_li_p]:mt-1
          [&_.tiptap_li_p]:mb-1
          
          /* Heading styles */
          [&_.tiptap_h1]:leading-tight
          [&_.tiptap_h2]:leading-tight
          [&_.tiptap_h3]:leading-tight
          [&_.tiptap_h4]:leading-tight
          [&_.tiptap_h5]:leading-tight
          [&_.tiptap_h6]:leading-tight
          [&_.tiptap_h1]:mt-14
          [&_.tiptap_h2]:mt-14
          [&_.tiptap_h1]:mb-6
          [&_.tiptap_h2]:mb-6
          [&_.tiptap_h3]:mt-10
          [&_.tiptap_h4]:mt-10
          [&_.tiptap_h5]:mt-10
          [&_.tiptap_h6]:mt-10
          [&_.tiptap_h1]:text-2xl
          [&_.tiptap_h1]:font-bold
          [&_.tiptap_h2]:text-xl
          [&_.tiptap_h2]:font-bold
          [&_.tiptap_h3]:text-lg
          [&_.tiptap_h3]:font-semibold
          [&_.tiptap_h4]:text-base
          [&_.tiptap_h4]:font-semibold
          [&_.tiptap_h5]:text-base
          [&_.tiptap_h5]:font-medium
          [&_.tiptap_h6]:text-base
          [&_.tiptap_h6]:font-medium
          
          /* Code styles */
          [&_.tiptap_code]:bg-purple-100
          [&_.tiptap_code]:rounded-md
          [&_.tiptap_code]:text-black
          [&_.tiptap_code]:text-sm
          [&_.tiptap_code]:px-1
          [&_.tiptap_code]:py-0.5
          [&_.tiptap_code]:font-mono
          
          /* Pre styles */
          [&_.tiptap_pre]:bg-black
          [&_.tiptap_pre]:rounded-lg
          [&_.tiptap_pre]:text-white
          [&_.tiptap_pre]:font-mono
          [&_.tiptap_pre]:my-6
          [&_.tiptap_pre]:px-4
          [&_.tiptap_pre]:py-3
          [&_.tiptap_pre]:overflow-x-auto
          [&_.tiptap_pre_code]:bg-transparent
          [&_.tiptap_pre_code]:text-inherit
          [&_.tiptap_pre_code]:text-sm
          [&_.tiptap_pre_code]:p-0
          
          /* Mark/Highlight styles */
          [&_.tiptap_mark]:bg-yellow-200
          [&_.tiptap_mark]:rounded-sm
          [&_.tiptap_mark]:px-1
          [&_.tiptap_mark]:py-0.5
          
          /* Blockquote styles */
          [&_.tiptap_blockquote]:border-l-4
          [&_.tiptap_blockquote]:border-gray-300
          [&_.tiptap_blockquote]:my-6
          [&_.tiptap_blockquote]:pl-4
          [&_.tiptap_blockquote]:italic
          [&_.tiptap_blockquote]:text-gray-600
          
          /* HR styles */
          [&_.tiptap_hr]:border-none
          [&_.tiptap_hr]:border-t
          [&_.tiptap_hr]:border-gray-200
          [&_.tiptap_hr]:my-8
          
          /* Paragraph styles */
          [&_.tiptap_p]:my-3
          [&_.tiptap_p]:leading-relaxed
          
          /* Focus styles */
          [&_.tiptap]:focus-visible:outline-none
        "
      />
    </div>
  );
};

export default TiptapEditor;

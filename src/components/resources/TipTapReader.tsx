import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";

interface TipTapReaderProps {
  content: string;
  className?: string;
}

const TipTapReader: React.FC<TipTapReaderProps> = ({
  content,
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
    content: content || "<p></p>",
    editable: false, // Read-only mode
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none",
      },
    },
  });

  return (
    <div className={className}>
      <EditorContent
        editor={editor}
        className="
          [&_.tiptap]:outline-none
          [&_.tiptap]:prose
          [&_.tiptap]:prose-sm
          [&_.tiptap]:max-w-none
          
          /* First child margin reset */
          [&_.tiptap_*:first-child]:mt-0
          
          /* List styles */
          [&_.tiptap_ul]:px-4
          [&_.tiptap_ol]:px-4
          [&_.tiptap_ul]:my-3
          [&_.tiptap_ol]:my-3
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
          [&_.tiptap_h1]:mt-6
          [&_.tiptap_h2]:mt-6
          [&_.tiptap_h1]:mb-4
          [&_.tiptap_h2]:mb-4
          [&_.tiptap_h3]:mt-4
          [&_.tiptap_h4]:mt-4
          [&_.tiptap_h5]:mt-4
          [&_.tiptap_h6]:mt-4
          [&_.tiptap_h3]:mb-3
          [&_.tiptap_h4]:mb-3
          [&_.tiptap_h5]:mb-3
          [&_.tiptap_h6]:mb-3
          [&_.tiptap_h1]:text-xl
          [&_.tiptap_h1]:font-bold
          [&_.tiptap_h2]:text-lg
          [&_.tiptap_h2]:font-bold
          [&_.tiptap_h3]:text-base
          [&_.tiptap_h3]:font-semibold
          [&_.tiptap_h4]:text-sm
          [&_.tiptap_h4]:font-semibold
          [&_.tiptap_h5]:text-sm
          [&_.tiptap_h5]:font-medium
          [&_.tiptap_h6]:text-sm
          [&_.tiptap_h6]:font-medium
          
          /* Code styles */
          [&_.tiptap_code]:bg-purple-100
          [&_.tiptap_code]:rounded-md
          [&_.tiptap_code]:text-black
          [&_.tiptap_code]:text-xs
          [&_.tiptap_code]:px-1
          [&_.tiptap_code]:py-0.5
          [&_.tiptap_code]:font-mono
          
          /* Pre styles */
          [&_.tiptap_pre]:bg-black
          [&_.tiptap_pre]:rounded-lg
          [&_.tiptap_pre]:text-white
          [&_.tiptap_pre]:font-mono
          [&_.tiptap_pre]:my-4
          [&_.tiptap_pre]:px-3
          [&_.tiptap_pre]:py-2
          [&_.tiptap_pre]:overflow-x-auto
          [&_.tiptap_pre_code]:bg-transparent
          [&_.tiptap_pre_code]:text-inherit
          [&_.tiptap_pre_code]:text-xs
          [&_.tiptap_pre_code]:p-0
          
          /* Mark/Highlight styles */
          [&_.tiptap_mark]:bg-yellow-200
          [&_.tiptap_mark]:rounded-sm
          [&_.tiptap_mark]:px-1
          [&_.tiptap_mark]:py-0.5
          
          /* Blockquote styles */
          [&_.tiptap_blockquote]:border-l-4
          [&_.tiptap_blockquote]:border-gray-300
          [&_.tiptap_blockquote]:my-4
          [&_.tiptap_blockquote]:pl-4
          [&_.tiptap_blockquote]:italic
          [&_.tiptap_blockquote]:text-gray-600
          
          /* HR styles */
          [&_.tiptap_hr]:border-none
          [&_.tiptap_hr]:border-t
          [&_.tiptap_hr]:border-gray-200
          [&_.tiptap_hr]:my-6
          
          /* Paragraph styles */
          [&_.tiptap_p]:my-2
          [&_.tiptap_p]:leading-relaxed
          [&_.tiptap_p]:text-sm
          
          /* Text alignment */
          [&_.tiptap_[data-text-align='left']]:text-left
          [&_.tiptap_[data-text-align='center']]:text-center
          [&_.tiptap_[data-text-align='right']]:text-right
          [&_.tiptap_[data-text-align='justify']]:text-justify
          
          /* Focus styles - disabled for read-only */
          [&_.tiptap]:focus-visible:outline-none
        "
      />
    </div>
  );
};

export default TipTapReader;
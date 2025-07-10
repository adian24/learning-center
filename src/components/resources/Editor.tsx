"use client";

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import QuillEditor from "./QuillEditor";
import Quill from "quill";

const Delta = Quill.import("delta");

interface EditorProps {
  value?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export interface EditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
  focus: () => void;
}

const Editor = forwardRef<EditorRef, EditorProps>((
  { value, onChange, placeholder = "Start writing your content here...", className, readOnly = false },
  ref
) => {
  const quillRef = useRef<Quill | null>(null);

  useImperativeHandle(ref, () => ({
    getContent: () => {
      if (quillRef.current) {
        return quillRef.current.root.innerHTML;
      }
      return "";
    },
    setContent: (content: string) => {
      if (quillRef.current) {
        quillRef.current.root.innerHTML = content;
      }
    },
    focus: () => {
      if (quillRef.current) {
        quillRef.current.focus();
      }
    }
  }));

  const handleTextChange = (delta: any, oldDelta: any, source: string) => {
    if (source === 'user' && onChange && quillRef.current) {
      const content = quillRef.current.root.innerHTML;
      onChange(content);
    }
  };

  useEffect(() => {
    if (value !== undefined && quillRef.current) {
      const currentContent = quillRef.current.root.innerHTML;
      if (currentContent !== value) {
        quillRef.current.root.innerHTML = value;
      }
    }
  }, [value]);

  return (
    <div className={`w-full ${className || ''}`}>
      <QuillEditor
        ref={quillRef}
        placeholder={placeholder}
        onTextChange={handleTextChange}
        readOnly={readOnly}
      />
    </div>
  );
});

Editor.displayName = "Editor";

export default Editor;

// Legacy component for backward compatibility
export const StandaloneEditor = () => {
  const quillRef = useRef<Quill | null>(null);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg">
        <QuillEditor
          ref={quillRef}
          placeholder="Start writing your content here..."
          defaultValue={new Delta()
            .insert("Welcome to the Enhanced Editor!")
            .insert("\n", { header: 1 })
            .insert("This editor supports: ")
            .insert("\n")
            .insert("• Rich text formatting")
            .insert("\n")
            .insert("• Image upload and paste")
            .insert("\n")
            .insert("• Tables and lists")
            .insert("\n")
            .insert("• Code blocks")
            .insert("\n")
            .insert("• And much more!")
            .insert("\n")}
        />
      </div>
    </div>
  );
};

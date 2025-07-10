"use client";

import React, {
  forwardRef,
  Ref,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

// Custom styles to make the editor taller
const editorStyles = `
  .quill-editor-container .ql-editor {
    min-height: 350px;
    max-height: 600px;
    overflow-y: auto;
  }
  .quill-editor-container .ql-container {
    min-height: 350px;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = editorStyles;
  document.head.appendChild(styleSheet);
}

interface QuillEditorProps {
  readOnly?: boolean;
  defaultValue?: any;
  onTextChange?: (...args: any[]) => void;
  onSelectionChange?: (...args: any[]) => void;
  placeholder?: string;
  theme?: "snow" | "bubble";
  modules?: any;
  formats?: string[];
}

// Editor is an uncontrolled React component
const QuillEditor = forwardRef<Quill, QuillEditorProps>(
  (
    {
      readOnly,
      defaultValue,
      onTextChange,
      onSelectionChange,
      placeholder,
      theme = "snow",
      modules,
      formats,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
      if (typeof ref === "object" && ref !== null && ref.current) {
        ref.current.enable(!readOnly);
      }
    }, [ref, readOnly]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const editorContainer = container.appendChild(
        container.ownerDocument.createElement("div")
      );
      const quill = new Quill(editorContainer, {
        theme: "snow",
        placeholder: "Write something amazing...",
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              [{ font: [] }],
              [{ size: ["small", false, "large", "huge"] }],
              ["bold", "italic", "underline", "strike"],
              [{ color: [] }, { background: [] }],
              [{ script: "sub" }, { script: "super" }],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ indent: "-1" }, { indent: "+1" }],
              [{ align: [] }],
              ["blockquote", "code-block"],
              ["link", "image", "video"],
              ["clean"],
            ],
            handlers: {
              image: function () {
                const input = document.createElement("input");
                input.setAttribute("type", "file");
                input.setAttribute("accept", "image/*");
                input.click();

                input.onchange = () => {
                  const file = input.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const range = quill.getSelection();
                      quill.insertEmbed(
                        range?.index || 0,
                        "image",
                        e.target?.result
                      );
                    };
                    reader.readAsDataURL(file);
                  }
                };
              },
            },
          },
          clipboard: {
            matchVisual: false,
          },
          history: {
            delay: 1000,
            maxStack: 50,
            userOnly: true,
          },
        },
        formats: [
          "header",
          "font",
          "size",
          "bold",
          "italic",
          "underline",
          "strike",
          "color",
          "background",
          "script",
          "list",
          "indent",
          "align",
          "blockquote",
          "code-block",
          "link",
          "image",
          "video"
        ],
      });

      if (typeof ref === "object" && ref !== null) {
        ref.current = quill;
      }

      if (defaultValueRef.current) {
        quill.setContents(defaultValueRef.current);
      }

      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        onTextChangeRef.current?.(...args);
      });

      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.(...args);
      });

      return () => {
        if (typeof ref === "object" && ref !== null) {
          ref.current = null;
        }
        container.innerHTML = "";
      };
    }, [ref]);

    return (
      <div
        ref={containerRef}
        style={{ minHeight: "400px" }}
        className="quill-editor-container"
      />
    );
  }
);

QuillEditor.displayName = "QuillEditor";

export default QuillEditor;

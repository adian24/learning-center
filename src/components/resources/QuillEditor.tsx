"use client";

import React, {
  forwardRef,
  Ref,
  useRef,
  useMemo,
  useEffect,
  useLayoutEffect,
} from "react";
import ReactQuill, { Quill } from "react-quill-new";
import QuillTableBetter from "quill-table-better";
import "react-quill-new/dist/quill.snow.css";
import "quill-table-better/dist/quill-table-better.css";

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
  
  /* Table Better Styles */
  .quill-editor-container .ql-table-better-wrapper {
    border: 1px solid #ccc;
    border-collapse: collapse;
  }
  .quill-editor-container .ql-table-better {
    border-collapse: collapse;
    width: 100%;
    margin: 10px 0;
  }
  .quill-editor-container .ql-table-better td,
  .quill-editor-container .ql-table-better th {
    border: 1px solid #ccc;
    padding: 8px;
    min-width: 50px;
    min-height: 20px;
  }
  .quill-editor-container .ql-table-better td:hover,
  .quill-editor-container .ql-table-better th:hover {
    background-color: #f0f0f0;
  }
`;

// Register quill-table-better
Quill.register({ "modules/table-better": QuillTableBetter }, true);

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
const QuillEditor = forwardRef<ReactQuill, QuillEditorProps>(
  (
    {
      readOnly,
      defaultValue,
      onTextChange,
      onSelectionChange,
      placeholder = "Write something amazing...",
      theme = "snow",
      modules,
      formats,
    },
    ref
  ) => {
    const quillRef = useRef<ReactQuill>(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    const quillModules = useMemo(
      () => ({
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
            ["link", "image", "video", "table-better"],
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
                    const editor = quillRef.current?.getEditor();
                    if (editor) {
                      const range = editor.getSelection();
                      editor.insertEmbed(
                        range?.index || 0,
                        "image",
                        e.target?.result
                      );
                    }
                  };
                  reader.readAsDataURL(file);
                }
              };
            },
          },
        },
        table: false,
        "table-better": {
          language: "en_US",
          menus: [
            "column",
            "row",
            "merge",
            "table",
            "cell",
            "wrap",
            "copy",
            "delete",
          ],
          toolbarTable: true,
        },
        keyboard: {
          bindings: QuillTableBetter.keyboardBindings,
        },
        clipboard: {
          matchVisual: false,
        },
        history: {
          delay: 1000,
          maxStack: 50,
          userOnly: true,
        },
        ...modules,
      }),
      [modules]
    );

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
      if (quillRef.current && ref) {
        if (typeof ref === "object" && ref !== null) {
          ref.current = quillRef.current;
        }
      }
    }, [ref]);

    useEffect(() => {
      if (quillRef.current && readOnly !== undefined) {
        const editor = quillRef.current.getEditor();
        editor.enable(!readOnly);
      }
    }, [readOnly]);

    const handleChange = (
      content: string,
      delta: any,
      source: any,
      editor: any
    ) => {
      onTextChangeRef.current?.(delta, editor.getContents(), source);
    };

    const handleSelectionChange = (range: any, source: any, editor: any) => {
      onSelectionChangeRef.current?.(range, {}, source);
    };

    return (
      <div className="quill-editor-container" style={{ minHeight: "400px" }}>
        <ReactQuill
          ref={quillRef}
          theme={theme}
          placeholder={placeholder}
          defaultValue={defaultValue}
          modules={quillModules}
          formats={formats}
          onChange={handleChange}
          onChangeSelection={handleSelectionChange}
          readOnly={readOnly}
        />
      </div>
    );
  }
);

QuillEditor.displayName = "QuillEditor";

export default QuillEditor;

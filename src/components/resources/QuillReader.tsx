"use client";

import React from "react";

// Custom styles for read-only display
const readerStyles = `
  .quill-reader-container .ql-toolbar {
    display: none !important;
  }
  
  .quill-reader-container .ql-editor {
    border: none !important;
    padding: 0 !important;
    font-family: inherit !important;
    font-size: 14px !important;
    line-height: 1.6 !important;
    color: inherit !important;
  }
  
  .quill-reader-container .ql-container {
    border: none !important;
    font-family: inherit !important;
  }
  
  .quill-reader-container .ql-editor.ql-blank::before {
    display: none !important;
  }
  
  /* Typography styles */
  .quill-reader-container h1 {
    font-size: 1.5rem !important;
    font-weight: 700 !important;
    margin-top: 1.5rem !important;
    margin-bottom: 1rem !important;
    line-height: 1.25 !important;
  }
  
  .quill-reader-container h2 {
    font-size: 1.25rem !important;
    font-weight: 700 !important;
    margin-top: 1.5rem !important;
    margin-bottom: 1rem !important;
    line-height: 1.25 !important;
  }
  
  .quill-reader-container h3 {
    font-size: 1.125rem !important;
    font-weight: 600 !important;
    margin-top: 1rem !important;
    margin-bottom: 0.75rem !important;
    line-height: 1.375 !important;
  }
  
  .quill-reader-container h4,
  .quill-reader-container h5,
  .quill-reader-container h6 {
    font-size: 1rem !important;
    font-weight: 600 !important;
    margin-top: 1rem !important;
    margin-bottom: 0.75rem !important;
    line-height: 1.5 !important;
  }
  
  .quill-reader-container p {
    margin-bottom: 0.5rem !important;
    line-height: 1.625 !important;
  }
  
  .quill-reader-container ul,
  .quill-reader-container ol {
    margin: 0.75rem 0 !important;
    padding-left: 1.5rem !important;
  }
  
  .quill-reader-container li {
    margin-bottom: 0.25rem !important;
  }
  
  .quill-reader-container blockquote {
    border-left: 4px solid #d1d5db !important;
    margin: 1rem 0 !important;
    padding-left: 1rem !important;
    font-style: italic !important;
    color: #6b7280 !important;
  }
  
  .quill-reader-container pre {
    background-color: #1f2937 !important;
    color: #f9fafb !important;
    padding: 0.75rem !important;
    border-radius: 0.5rem !important;
    overflow-x: auto !important;
    margin: 1rem 0 !important;
    font-family: 'Courier New', monospace !important;
    font-size: 0.875rem !important;
  }
  
  .quill-reader-container code {
    background-color: #f3f4f6 !important;
    color: #1f2937 !important;
    padding: 0.125rem 0.25rem !important;
    border-radius: 0.25rem !important;
    font-family: 'Courier New', monospace !important;
    font-size: 0.875rem !important;
  }
  
  .quill-reader-container pre code {
    background-color: transparent !important;
    color: inherit !important;
    padding: 0 !important;
  }
  
  .quill-reader-container img {
    max-width: 100% !important;
    height: auto !important;
    border-radius: 0.5rem !important;
    margin: 1rem 0 !important;
  }
  
  .quill-reader-container a {
    color: #2563eb !important;
    text-decoration: underline !important;
  }
  
  .quill-reader-container a:hover {
    color: #1d4ed8 !important;
  }
  
  .quill-reader-container strong {
    font-weight: 600 !important;
  }
  
  .quill-reader-container em {
    font-style: italic !important;
  }
  
  .quill-reader-container u {
    text-decoration: underline !important;
  }
  
  .quill-reader-container s {
    text-decoration: line-through !important;
  }
  
  /* Table styles for quill-table-better */
  .quill-reader-container .ql-table-better-wrapper {
    border: 1px solid #e5e7eb !important;
    border-collapse: collapse !important;
    margin: 1rem 0 !important;
  }
  
  .quill-reader-container .ql-table-better {
    border-collapse: collapse !important;
    width: 100% !important;
    margin: 0 !important;
  }
  
  .quill-reader-container .ql-table-better td,
  .quill-reader-container .ql-table-better th {
    border: 1px solid #e5e7eb !important;
    padding: 8px 12px !important;
    vertical-align: top !important;
    text-align: left !important;
  }
  
  .quill-reader-container .ql-table-better th {
    background-color: #f9fafb !important;
    font-weight: 600 !important;
  }
  
  .quill-reader-container .ql-table-better tr:nth-child(even) {
    background-color: #f9fafb !important;
  }
  
  .quill-reader-container .ql-table-better tr:hover {
    background-color: #f3f4f6 !important;
  }
`;

// No need to register table-better for read-only display

// Inject styles once
if (typeof document !== 'undefined') {
  const existingStyle = document.querySelector('#quill-reader-styles');
  if (!existingStyle) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'quill-reader-styles';
    styleSheet.textContent = readerStyles;
    document.head.appendChild(styleSheet);
  }
}

interface QuillReaderProps {
  content: string;
  className?: string;
}

const QuillReader: React.FC<QuillReaderProps> = ({
  content,
  className = ""
}) => {
  // Clean up temporary elements and render as HTML
  const cleanContent = content ? content.replace(/<temporary[^>]*>.*?<\/temporary>/g, '') : '';
  
  return (
    <div 
      className={`quill-reader-container ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  );
};

export default QuillReader;
import DOMPurify from "dompurify";
import parse from "html-react-parser";

const HTMLContent = ({ content }: { content: string }) => {
  // Sanitize HTML menggunakan DOMPurify
  const cleanHTML = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      "a",
      "div",
      "span",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "br",
      "strong",
      "em",
      "u",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
    ],
    ALLOWED_ATTR: ["class", "id"],
  });

  return <div className="prose prose-sm max-w-none">{parse(cleanHTML)}</div>;
};

export default HTMLContent;

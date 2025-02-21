"use client";

import { useFormStatus } from "react-dom";
import { Button } from "../ui/button";

interface ActionButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  loadingText?: string;
  defaultText?: string;
  disabled?: boolean;
  className?: string;
}

export default function ActionButton({
  loadingText = "Loading...",
  defaultText,
  disabled,
  className,
  ...props
}: ActionButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} className={className} disabled={pending || disabled}>
      {pending ? loadingText : defaultText}
    </Button>
  );
}

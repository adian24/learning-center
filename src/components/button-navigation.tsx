"use client";

import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface ButtonNvigationProps {
  text: string;
  url?: string;
  className?: string;
}

const ButtonNvigation = ({
  text,
  className = "w-full",
  url,
}: ButtonNvigationProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (url) {
      router.push(url);
    }
  };

  return (
    <Button className={className} size="lg" onClick={handleClick}>
      {text}
    </Button>
  );
};

export default ButtonNvigation;

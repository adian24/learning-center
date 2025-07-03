"use client";

import { useTheme } from "next-themes";
import React from "react";
import { Toaster } from "sonner";

const ToasterPrivder = () => {
  const { theme } = useTheme();
  const current_theme = theme == "dark" ? "dark" : "light";

  return (
    <Toaster
      position="top-right"
      richColors={true}
      closeButton
      theme={current_theme}
    />
  );
};

export default ToasterPrivder;

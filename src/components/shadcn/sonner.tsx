"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--secbuttn)",
          "--normal-text": "var(--primary)",
          "--normal-border": "var(--primary-muted)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

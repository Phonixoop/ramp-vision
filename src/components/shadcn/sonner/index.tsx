"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      dir="rtl"
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-secondary group-[.toaster]:text-primary group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-accent",
          actionButton:
            "group-[.toast]:bg-accent group-[.toast]:text-secondary",
          cancelButton:
            "group-[.toast]:bg-accent group-[.toast]:text-secondary",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

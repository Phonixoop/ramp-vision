"use client";
import { MoonIcon, SunIcon, MinusIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Button from "~/ui/buttons";
import { cn } from "~/lib/utils";

interface ThemeSwitchProps {
  className?: string;
}

export function ThemeSwitch({ className = "" }: ThemeSwitchProps) {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="size-10 bg-third flex animate-pulse items-center justify-center rounded-full">
        <MinusIcon className="size-5 stroke-primary" />
      </div>
    );
  }

  return (
    <Button
      className={cn(
        "size-10 border-third rounded-full shadow-[0px_0px_20px_0px_rgba(var(--dikado-yellow-800),0.1)]",
        className,
      )}
      onClick={() => {
        if (resolvedTheme === "theme-light-4") {
          setTheme("theme-dark-1");
        } else {
          setTheme("theme-light-4");
        }
      }}
    >
      {resolvedTheme === "theme-dark-1" ? (
        <MoonIcon className="size-5 fill-dikado-blue-default" />
      ) : (
        <SunIcon className="size-5 stroke-dikado-yellow-default" />
      )}
    </Button>
  );
}

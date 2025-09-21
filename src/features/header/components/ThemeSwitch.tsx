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
      <div className="bg-third flex size-10 animate-pulse items-center justify-center rounded-full">
        <MinusIcon className="size-5 stroke-primary" />
      </div>
    );
  }

  return (
    <Button
      className={cn(
        "border-third size-10 rounded-full shadow-[0px_0px_20px_0px_rgba(var(--dikado-yellow-800),0.1)]",
        className,
      )}
      onClick={() => {
        if (resolvedTheme === "light") {
          setTheme("dark");
        } else {
          setTheme("light");
        }
      }}
    >
      {resolvedTheme === "theme-dark-1" ? (
        <MoonIcon className="fill-dikado-blue-default size-5" />
      ) : (
        <SunIcon className="stroke-dikado-yellow-default size-5" />
      )}
    </Button>
  );
}

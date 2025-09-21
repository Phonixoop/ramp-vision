"use client";

import React, { useState, useEffect } from "react";
import { ComboBox } from "~/features/shadui/ComboBox";
import { motion } from "framer-motion";
import { cn } from "~/lib/utils";
import Button from "~/ui/buttons";
import { CheckCircleIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { THEMESE } from "~/constants/theme";
import { useTheme } from "next-themes";
motion;

export default function ThemeBox() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  // Apply theme to body when resolvedTheme changes
  useEffect(() => {
    if (mounted && resolvedTheme) {
      document.querySelector("body").className = resolvedTheme;
    }
  }, [resolvedTheme, mounted]);

  if (!mounted) {
    return (
      <div className="scale-75">
        <div className="h-10 w-32 animate-pulse rounded bg-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="scale-75">
      <ComboBox
        value={theme || "system"}
        placeHolder="جستجو تم"
        values={THEMESE}
        onChange={(value) => {
          setTheme(value);
        }}
      />
    </div>
  );
}

export function ThemeBoxHovery() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  // Apply theme to body when resolvedTheme changes
  useEffect(() => {
    if (mounted && resolvedTheme) {
      document.querySelector("body").className = resolvedTheme;
    }
  }, [resolvedTheme, mounted]);

  if (!mounted) {
    return (
      <div className="flex animate-pulse items-center justify-center gap-2 rounded-t-3xl bg-gray-200 p-4">
        <div className="h-8 w-8 rounded-full bg-gray-300"></div>
        <div className="h-8 w-8 rounded-full bg-gray-300"></div>
        <div className="h-8 w-8 rounded-full bg-gray-300"></div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="flex items-center justify-center gap-2 rounded-t-3xl bg-secbuttn/50 p-4 backdrop-blur-xl transition-colors"
        onMouseLeave={() => {
          if (resolvedTheme) {
            document.querySelector("body").className = resolvedTheme;
          }
        }}
      >
        {THEMESE.map((themeOption) => {
          return (
            <motion.div
              key={themeOption.value}
              onMouseEnter={() => {
                document.querySelector("body").className = themeOption.value;
              }}
              className={`${themeOption.value} transition-transform`}
              style={{
                scale: themeOption.value === theme ? "100%" : "60%",
              }}
            >
              <Button
                className={cn(
                  "flex scale-100 items-center justify-center rounded-full border-accent bg-accent p-1 transition-transform ",
                )}
                onClick={() => {
                  setTheme(themeOption.value);
                }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary">
                  <CheckCircleIcon
                    className={twMerge(
                      "stroke-accent",
                      themeOption.value === theme ? "visible" : "hidden",
                    )}
                  />
                </span>
              </Button>
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );
}

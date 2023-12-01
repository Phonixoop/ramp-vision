import React from "react";
import { useState } from "react";
import { ComboBox } from "~/features/shadui/ComboBox";

import useLocalStorage from "~/hooks/useLocalStorage";
import { motion } from "framer-motion";
import { cn } from "~/lib/utils";
import Button from "~/ui/buttons";
import { CheckCircleIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { THEMESE } from "~/constants/theme";
motion;
export default function ThemeBox() {
  const [value, setValue] = useLocalStorage("theme", () => {
    return localStorage.getItem("theme");
  });

  return (
    <div className="scale-75">
      <ComboBox
        value={value}
        placeHolder="جستجو تم"
        values={THEMESE}
        onChange={(value) => {
          localStorage.setItem("theme", value);
          document.querySelector("body").className = value;
          setValue(value);
        }}
      />
    </div>
  );
}

export function ThemeBoxHovery() {
  const canUseDOM: boolean = !!(
    typeof window !== "undefined" &&
    typeof window.document !== "undefined" &&
    typeof window.document.createElement !== "undefined"
  );
  const [value, setValue] = useLocalStorage("theme", () => {
    if (canUseDOM) {
      return localStorage.getItem("theme");
    }
  });

  return (
    <>
      <motion.div
        className="flex items-center justify-center gap-2 rounded-t-3xl bg-secbuttn/50 p-4 backdrop-blur-xl transition-colors"
        onMouseLeave={() => {
          document.querySelector("body").className = value;
        }}
      >
        {THEMESE.map((theme) => {
          return (
            <motion.div
              key={theme.value}
              onMouseEnter={() => {
                // localStorage.setItem("theme", value);
                document.querySelector("body").className = theme.value;
              }}
              className={`${theme.value} transition-transform`}
              style={{
                scale: theme.value == value ? "100%" : "60%",
              }}
            >
              <Button
                className={cn(
                  "flex scale-100 items-center justify-center rounded-full border-accent bg-accent p-1 transition-transform ",
                )}
                onClick={() => {
                  document.querySelector("body").className = theme.value;
                  setValue(theme.value);
                }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary">
                  <CheckCircleIcon
                    className={twMerge(
                      "stroke-accent",
                      theme.value == value ? "visible" : "hidden",
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

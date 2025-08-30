import React, { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import ThreeDotsWave from "~/ui/loadings/three-dots-wave";
import { motion, type MotionProps } from "motion/react";
import { cn } from "~/lib/utils";
import LoaderAnim from "~/components/main/loader-anim";

type ButtonProps = {
  children: ReactNode;
  isLoading?: boolean;
  initialtranslateY?: number;
  translateY?: number;
  styles?: CSSProperties;
  fillWidthOnHover?: boolean;
  loadType?: "three-dots" | "circle";
  loaderWrapper?: "replace" | "next-to-children";
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onAnimationStart" | "onDrag" | "onDragEnd" | "onDragStart" | "ref"
> &
  MotionProps;

export default function Button({
  children,
  type = "button",
  disabled = false,
  isLoading = false,
  loadType = "three-dots",
  loaderWrapper = "next-to-children",
  className = "",
  initialtranslateY = 0,
  translateY = 0,
  fillWidthOnHover = false,
  onClick,
  styles,
  ...rest
}: ButtonProps) {
  const enabledClass = `hover:bg-opacity-95 cursor-pointer`;
  const busyClass = `bg-gray-200  text-gray-500 cursor-not-allowed`;

  return (
    <motion.button
      whileTap={{
        scale: disabled || isLoading ? 1 : 0.95,
        transition: { duration: 0.1, ease: "easeOut" },
      }}
      {...(fillWidthOnHover ? { whileHover: { width: "100%" } } : {})}
      initial={{ y: initialtranslateY }}
      animate={{ y: translateY }}
      transition={{ duration: 0.2, ease: "linear" }}
      disabled={disabled || isLoading}
      dir="rtl"
      type={type}
      onClick={onClick}
      className={cn(
        "duration-400 relative flex select-none items-center justify-center rounded-lg p-2 text-primary transition-all duration-100 ease-out hover:scale-105 active:scale-95",
        className,
        disabled ? busyClass : enabledClass,
        isLoading ? "bg-opacity-10" : "",
      )}
      {...rest}
    >
      {/* render children when is not loading, render children when is loading and loaderWrapper is next-to-children */}
      {(isLoading && loaderWrapper === "next-to-children" && children) ||
        (!isLoading && children)}
      {isLoading && (
        <div
          dir="rtl"
          className={cn(
            " top-7 flex h-fit w-fit items-center justify-start",
            loaderWrapper === "replace" ? "relative" : "absolute",
          )}
        >
          {loadType === "three-dots" ? <ThreeDotsWave /> : <LoaderAnim />}
        </div>
      )}
    </motion.button>
  );
}

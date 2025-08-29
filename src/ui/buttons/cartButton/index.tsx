"use client";

import React from "react";
import { motion } from "framer-motion";

interface CartButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function CartButton({
  children,
  className,
  type = "button",
  disabled = false,
  onClick = () => {},
  ...rest
}: CartButtonProps) {
  const activeClass = "text-atysa-main hover:bg-atysa-main hover:text-white";
  const disabledClass =
    "text-[rgb(166,170,173)] bg-[rgb(237,239,240)] border-gray-200";
  return (
    <>
      <style jsx>
        {`
          .btn-shadow {
            box-shadow: rgb(58 61 66 / 6%) 0px 1px 0px,
              rgb(0 0 0 / 20%) 0px 4px 16px -8px;
          }
          .disabled {
            color: rgb(166, 170, 173);
            background-color: rgb(237, 239, 240);
            border-color: rgba(255, 0, 166, 0.06);
          }
        `}
      </style>
      <motion.button
        whileTap={{
          scale: 0.95,
          transition: {
            duration: 0.2,
          },
        }}
        type={type}
        disabled={disabled}
        onClick={() => onClick()}
        className={`
          ${
            className
              ? className
              : `min-w[6rem]
          md:w-[100px] w-[120px]
          h-9
          border-t-[1px]
          border-l-[1px]
          border-r-[1px]
          border-b-[2px]
          bg-clip-padding
          text-[0.875rem]
          inline-flex
          justify-center
          items-center
          text-center
          btn-shadow  
         rounded-full px-2 py-[1px] select-none
         transition-all duration-150 ease-out `
          }
        ${disabled ? disabledClass : activeClass} `}
        {...rest}
      >
        {children}
      </motion.button>
    </>
  );
}

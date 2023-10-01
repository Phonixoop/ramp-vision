import React from "react";
import CartButton from "ui/buttons/cartButton";
import { motion } from "framer-motion";
export default function CircleButton({
  type = "button",
  children,
  className,
  ...rest
}) {
  return (
    <motion.button
      type={type}
      whileTap={{
        scale: 0.8,
        transition: {
          duration: 0.2,
        },
      }}
      className={`${
        className ? className : `relative bg-atysa-main rounded-full p-2`
      }`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

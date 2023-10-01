import { motion } from "framer-motion";
import React from "react";

const LoadingDot = {
  display: "block",
  width: "0.7rem",
  height: "0.7rem",
  borderRadius: "50%",
};

const LoadingContainer = {
  width: "3rem",
  height: "1.5rem",
  display: "flex",
  justifyContent: "space-around",
};

const ContainerVariants = {
  initial: {
    transition: {
      staggerChildren: 0.2,
    },
  },
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const DotVariants = {
  initial: {
    y: "0%",
  },
  animate: {
    y: "100%",
  },
};

const DotTransition = {
  duration: 0.5,
  repeat: Infinity,
  ease: "easeInOut",
};

export default function ThreeDotsWave() {
  return (
    <div
      style={{
        paddingTop: "0rem",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        style={LoadingContainer}
        variants={ContainerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.span
          className="bg-accent"
          style={LoadingDot}
          variants={DotVariants}
          transition={DotTransition}
        />
        <motion.span
          className="bg-accent"
          style={LoadingDot}
          variants={DotVariants}
          transition={DotTransition}
        />
        <motion.span
          className="bg-accent"
          style={LoadingDot}
          variants={DotVariants}
          transition={DotTransition}
        />
      </motion.div>
    </div>
  );
}

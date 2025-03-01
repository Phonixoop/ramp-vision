"use client";
import ReactDOM from "react-dom";
import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useDragControls,
  useAnimation,
} from "framer-motion";
import { twMerge } from "tailwind-merge";

import useWindowSize from "~/hooks/useWindowSize";
import useKeyPress from "~/hooks/useKeyPress";
import XIcon from "~/ui/icons/xicon";
import ChevronLeftIcon from "~/ui/icons/chervons/chevron-left";
import Button from "~/ui/buttons";
import { cn } from "~/lib/utils";
import { useModal } from "~/context/modal.context";

// Helper functions
function usePrevious(value: any) {
  const previousValueRef = useRef();

  useEffect(() => {
    previousValueRef.current = value;
  }, [value]);

  return previousValueRef.current;
}

const overlayVariants = {
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      opacity: {
        duration: 0,
        delay: 0,
      },
    },
  },
  hidden: {
    opacity: 0,
    transition: {
      when: "afterChildren",
      duration: 0,
    },
  },
};

const boxVariants = {
  visible: {
    translateY: "0px",
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 1000,
    },
  },
  hidden: {
    translateY: "30px",
  },
};

const sizes = [
  { label: "xs", class: "md:w-[350px] w-full min-h-1/6 h-auto " },
  {
    label: "sm",
    class:
      "md:min-w-[550px] md:w-fit w-full min-h-[10%] md:h-auto md:max-h-[90%] ",
  },
  {
    label: "md blur",
    class: "md:min-w-[50%] md:w-fit w-full md:h-5/6 backdrop-blur ",
  },
  { label: "md", class: "md:min-w-[50%] md:w-fit w-full md:h-5/6 " },
  { label: "lg", class: "md:w-11/12 md:h-5/6 " },
];

function getSize(size: string) {
  return sizes.find((item) => item.label === size)?.class || "";
}

const BREAK_POINT = 700;

export default function Modal({
  children = undefined,
  isOpen = false,
  zIndex = "z-50",
  title = "",
  size = "md",
  center = false,
  onClose = () => {},
  className = "",
  childClassName = "",
  titleClassName = "",
  xClassName = "",
}) {
  const windowSize = useWindowSize();
  const prevIsOpen = usePrevious(isOpen);
  const boxRef = useRef<any>();
  const controls = useAnimation();
  const [top, setTop] = useState(true);
  const modalSize = getSize(size);
  const dragControls = useDragControls();

  const ref = useRef<Element | null>(null);

  const isOnMobile = windowSize?.width <= BREAK_POINT;

  const { incrementOpenModals, decrementOpenModals, openModals } = useModal();

  useEffect(() => {
    ref.current = document.querySelector<HTMLElement>("#portal");

    if (isOpen) {
      incrementOpenModals();
      document.body.style.overflow = "hidden";
    }
    return () => {
      decrementOpenModals();
      if (document.querySelectorAll(".modal-overlay").length === 0) {
        document.body.style.overflow = "overlay";
      }
    };
  }, [isOpen, openModals]);

  useKeyPress(() => {
    handleClose();
  }, ["Escape"]);

  function handleClose() {
    onClose();
  }

  return (
    ref.current &&
    ReactDOM.createPortal(
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={handleClose}
            className={cn(
              center ? "laptopMin:items-center" : "items-end",
              `fixed flex items-end justify-center overflow-clip bg-secondary/30 backdrop-blur-md ${zIndex} modal-overlay inset-0`,
            )}
            style={{
              zIndex: 1000,
            }}
          >
            <motion.div
              ref={boxRef}
              initial="hidden"
              animate="visible"
              variants={boxVariants}
              onClick={(e) => e.stopPropagation()}
              className={twMerge(
                modalSize,
                center ? "mobileMin:rounded-2xl" : "rounded-t-2xl",
                "relative z-[101] flex flex-col items-center justify-center gap-0 overflow-hidden border border-accent/50",
                isOnMobile ? "h-full" : "",
                className,
              )}
            >
              <div
                dir="rtl"
                className={`sticky top-[0px] z-20 flex h-auto w-full flex-col items-center justify-center overflow-hidden`}
              >
                <div
                  className={`flex w-full flex-row-reverse items-center justify-between p-3 ${
                    !isOnMobile ? "pl-[26px]" : "pr-[26px]"
                  }`}
                >
                  {isOnMobile && (
                    <div className="flex h-[24px] w-[24px] items-center justify-center">
                      <button
                        className="duration-400 relative flex w-full select-none items-center justify-center rounded-lg transition-all"
                        onClick={handleClose}
                      >
                        <ChevronLeftIcon className="h-5 w-5 fill-none stroke-primary stroke-2" />
                      </button>
                    </div>
                  )}
                  <p
                    className={cn(
                      "flex-1 items-center justify-center text-center text-primary",
                      titleClassName,
                    )}
                  >
                    {title}
                  </p>
                  {!isOnMobile && (
                    <div className="group flex h-8 w-8 items-center justify-center rounded-full hover:bg-primbuttn/20">
                      <Button
                        className="duration-400 relative flex w-full select-none items-center justify-center rounded-lg transition-all"
                        onClick={handleClose}
                      >
                        <XIcon
                          className={cn(
                            "h-7 w-7 scale-110 stroke-primbuttn group-hover:stroke-accent",
                            xClassName,
                          )}
                        />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <motion.div
                className={cn(
                  "m-0 h-full w-full overflow-y-auto p-0",
                  childClassName,
                )}
              >
                {children}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      ref.current,
    )
  );
}

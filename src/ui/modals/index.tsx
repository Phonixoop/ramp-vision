import ReactDOM from "react-dom";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRef } from "react";
import useWindowSize from "~/hooks/useWindowSize";
import {
  motion,
  AnimatePresence,
  useDragControls,
  useAnimation,
} from "framer-motion";

import XIcon from "~/ui/icons/xicon";
import useKeyPress from "~/hooks/useKeyPress";

import ChevronLeftIcon from "~/ui/icons/chervons/chevron-left";
import Button from "~/ui/buttons";
import { twMerge } from "tailwind-merge";

function usePrevious(value) {
  const previousValueRef = useRef();

  useEffect(() => {
    previousValueRef.current = value;
  }, [value]);

  return previousValueRef.current;
}
const overlayVariants = {
  visible: {
    opacity: 1,
    // backdropFilter: "blur(20px)",

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
    // backdropFilter: "blur(0px)",
    transition: {
      when: "afterChildren",
      duration: 0,
    },
  },
};

const boxVarients = {
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
const siezes = [
  {
    label: "xs",
    class: "md:w-[350px] w-full min-h-1/6 h-auto ",
  },
  {
    label: "sm",
    class:
      "md:min-w-[550px] md:w-fit w-full min-h-[10%] md:h-auto md:max-h-[90%] ",
  },
  {
    label: "md blur",
    class: "md:min-w-[50%] md:w-fit w-full md:h-5/6 backdrop-blur ",
  },
  {
    label: "md",
    class: "md:min-w-[50%] md:w-fit w-full md:h-5/6 ",
  },
  {
    label: "lg",
    class: "md:w-11/12 md:h-5/6 ",
  },
];
const smallClass = "md:w-[550px] "; //max-h-2/6
const meduimClass = "md:w-1/2 "; //max-h-5/6
const largeClass = "md:w-11/12 "; // max-h-5/6
function getSize(size) {
  return siezes.filter((item) => item.label === size).map((a) => a.class);
}

const BREAK_POINT = 700;
export default function Modal({
  children,
  isOpen = false,
  zIndex = "z-50",
  title = "",
  size = "md",
  center = false,
  onClose = () => {},
  className = "",
}) {
  const [mounted, setMounted] = useState(false);
  const windowSize = useWindowSize();
  const prevIsOpen = usePrevious(isOpen);
  const boxRef = useRef();
  const controls = useAnimation();
  const [top, setTop] = useState(true);
  const modalSize = getSize(size);
  const dragControls = useDragControls();

  const isOnMobile = windowSize.width <= BREAK_POINT;
  const canUseDOM = typeof window !== "undefined";
  const useIsomorphicLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;
  // useEffect(() => {
  //   setTop(`-top-['${window.screen.height}']`);
  // }, []);
  // useEffect(() => {
  //   if (prevIsOpen && !isOpen) {
  //     controls.start("hidden");
  //     handleClose();
  //   } else if (!prevIsOpen && isOpen) {
  //     controls.start("visible");
  //   }
  // }, [controls, isOpen, prevIsOpen]);

  useIsomorphicLayoutEffect(() => {
    setMounted(true);

    // if (isOpen) {
    //   document.body.style.overflow = "hidden";
    // }
    //  setY(modal.current.y);
  }, [isOpen]);

  useKeyPress(() => {
    handleClose();
  }, ["Escape"]);

  function handleClose() {
    const portalChildCount = document.getElementById("portal").children.length;
    // console.log({ portalChildCount }, "hi");
    if (portalChildCount <= 1) {
      document.body.style.overflow = "overlay";
    }
    onClose();
  }
  // function handleDragEnd(event, info) {
  //   if (info.offset.y > 260) {
  //     handleClose();
  //   }
  // }
  return mounted ? (
    ReactDOM.createPortal(
      <>
        <AnimatePresence mode="wait">
          {isOpen && (
            <>
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={overlayVariants}
                onClick={handleClose}
                className={twMerge(
                  center ? "laptopMin:items-center" : "items-end",
                  ` fixed  flex items-end justify-center overflow-hidden backdrop-blur-md ${zIndex} inset-0  `,
                )}
              >
                <motion.div
                  ref={boxRef}
                  initial="hidden"
                  animate="visible"
                  // dragControls={dragControls}
                  variants={boxVarients}
                  // drag="y"
                  // dragConstraints={{
                  //   top: 0, //-window.screen.height / 2 + 120
                  //   bottom: 0,
                  // }}
                  // dragElastic={0.8}
                  // onDragEnd={handleDragEnd}
                  // onTouchStart={(e) => {
                  //   dragControls.start(e, { dragListener: true });
                  // }}
                  onClick={(e) => e.stopPropagation()}
                  className={twMerge(
                    modalSize,
                    center ? "mobileMin:rounded-2xl" : "rounded-t-2xl",
                    "relative z-[101] flex  flex-col  items-center  justify-center gap-0 overflow-hidden border  border-accent/50  ",
                    isOnMobile ? "h-full" : "",
                  )}

                  // h-auto top-52
                >
                  <div
                    dir="rtl"
                    className={`sticky top-[0px] z-20 flex h-auto w-full  flex-col items-center justify-center  overflow-hidden  `}
                  >
                    {/* <div className="mobileMax:flex hidden w-1/2 h-[10px] bg-gray-300 mt-1 mb-auto rounded-2xl" /> */}
                    <div
                      className={`flex w-full flex-row-reverse items-center  justify-between p-3 ${
                        !isOnMobile ? "pl-[26px]" : "pr-[26px]"
                      }`}
                    >
                      {isOnMobile && (
                        <div className="flex h-[24px] w-[24px] items-center justify-center">
                          <button
                            className=" duration-400 relative flex w-full select-none items-center justify-center rounded-lg transition-all"
                            onClick={handleClose}
                          >
                            <ChevronLeftIcon className="h-5 w-5 fill-none stroke-primary stroke-2" />
                          </button>
                        </div>
                      )}
                      <p className="flex-1 items-center justify-center text-center text-primary">
                        {title}
                      </p>
                      {!isOnMobile && (
                        <div className="group flex h-8 w-8 items-center justify-center rounded-full hover:bg-primbuttn/20 ">
                          <Button
                            className="duration-400 relative flex w-full select-none items-center justify-center rounded-lg transition-all"
                            onClick={handleClose}
                          >
                            <XIcon className="h-7 w-7 scale-110 stroke-primbuttn group-hover:stroke-accent " />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <motion.div
                    // onTouchStartCapture={(e) => {
                    //   dragControls.start(e, { dragListener: false });
                    // }}
                    className="m-0 h-full w-full overflow-y-auto p-0"
                  >
                    {children}
                  </motion.div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>,
      document.getElementById("portal"),
    )
  ) : (
    <></>
  );
}

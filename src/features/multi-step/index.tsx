import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";
import Button from "~/ui/buttons";

export default function MultiStep({
  currentStep = 0,
  isLoading = false,
  loadingStep = -1,
  onStepClick = (step: number) => {},
  icons = [],
  steps = [],
  onNext = () => {},
  onPrevious = () => {},
}) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-5">
      <div className="relative flex min-h-[150px] w-full items-center justify-center gap-2 overflow-hidden md:w-2/3 ">
        <div className="absolute z-0 h-[1px] w-11/12  bg-gradient-to-r from-transparent from-0% via-accent via-50% to-transparent to-100%">
          {currentStep == loadingStep && (
            <div
              style={{
                left: `${Math.min(currentStep * 10, 100)}%`,
              }}
              className="absolute left-[50.5%] top-0 -z-10 hidden h-[28px] w-[40%] transition-all duration-300 sm:block"
            >
              <svg
                className="translate-x-0 translate-y-0"
                preserveAspectRatio="none"
                height="28px"
                width="100%"
                viewBox="0 0 482 28"
                fill="none"
              >
                <path d="M4 0.5H482" className="stroke-secondary"></path>
                <path
                  d="M16 0.5H466"
                  stroke="url(#kjhsdfg87346kjhs)"
                  strokeDasharray="4 4"
                  className="stroke-primary"
                ></path>
                <path
                  d="M0.5 0.5C29 0.5 20 27.5 49.5 27.5C49.5 27.5 400.5 27.5 433 27.5C465.5 27.5 448.5 0.5 482 0.5"
                  pathLength="1"
                  stroke="url(#klujyhsertd9087645uigh)"
                  className="Onboarding_TrackBranchLine__UTQSQ "
                ></path>
                <defs>
                  <linearGradient
                    id="kjhsdfg87346kjhs"
                    x1="0"
                    y1="0"
                    x2="482"
                    y2="28"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="var(--accent)"></stop>
                    <stop offset="1" stopColor="var(--accent)"></stop>
                  </linearGradient>
                  <linearGradient
                    id="klujyhsertd9087645uigh"
                    x1="0"
                    y1="0"
                    x2="482"
                    y2="28"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0" stopColor="var(--accent)"></stop>
                    <stop offset="0.1" stopColor="var(--bg-purple)"></stop>
                    <stop offset="1" stopColor="var(--bg-primary)"></stop>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}
        </div>
        <div className="absolute inset-0 flex w-full items-center justify-between  ">
          <Button
            disabled={isLoading}
            className={twMerge(
              "group absolute left-1 z-20 rounded-full p-1.5 ring-1 ring-accent transition duration-500 hover:bg-accent/20 hover:ring-secondary",
              currentStep === 0 ? "opacity-0" : "opacity-100",
            )}
            onClick={() => {
              if (currentStep - 1 >= 0) onPrevious();
            }}
          >
            <ChevronLeft className="h-5 w-5 stroke-primbuttn group-hover:stroke-accent " />
          </Button>
          <Button
            disabled={isLoading}
            className={twMerge(
              "group absolute right-1 z-20  rounded-full p-1.5 ring-1 ring-accent transition duration-500 hover:bg-accent/20 hover:ring-secondary",
              currentStep === icons.length - 1 ? "opacity-0" : "opacity-100",
            )}
            onClick={() => {
              if (currentStep + 1 <= icons.length - 1) onNext();
            }}
          >
            <ChevronRight className="h-5 w-5 stroke-primbuttn group-hover:stroke-accent " />
          </Button>
        </div>
        <div className="relative flex h-full w-full items-center justify-center gap-10  ">
          {icons.map((_, i) => {
            const offset = currentStep == icons.length ? 25 : 28;
            const currentLeft = offset + i * offset;
            const distance = Math.abs(currentStep - i);
            const scale =
              distance === 1 ? "100%" : distance === 2 ? "70%" : "0%";
            return (
              <button
                disabled={isLoading}
                key={i}
                onClick={() => {
                  onStepClick(i);
                }}
                className={twMerge(
                  "z-1 absolute  flex -translate-x-1/2 scale-75 cursor-pointer  rounded-full transition-all duration-200 ",
                  currentStep === i
                    ? "bg-primary stroke-secbuttn  "
                    : "bg-secondary stroke-accent opacity-0 sm:opacity-100",
                  i == loadingStep ? "sm:bottom-5" : "",
                )}
                style={{
                  left:
                    currentStep === i // this is not neccessary
                      ? `${50}%` // this is not neccessary
                      : `${Math.min(currentLeft - currentStep * 20, 100)}%`,

                  scale: currentStep === i ? "130%" : scale,
                }}
              >
                <span
                  className={twMerge(
                    `cursor-pointer  rounded-full border   stroke-inherit  p-3  transition-all duration-1000`,
                    currentStep === i
                      ? "border-primary opacity-100"
                      : "border-accent/50 bg-accent/20 opacity-50",
                    currentStep === loadingStep && i === loadingStep
                      ? "animate-spin "
                      : "",
                  )}
                >
                  {icons[i]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {steps.map((_, i) => {
        if (i === currentStep)
          return <React.Fragment key={i}>{steps[currentStep]}</React.Fragment>;
      })}
    </div>
  );
}

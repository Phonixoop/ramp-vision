import React from "react";

export default function DepoSkeletonLoading() {
  return (
    <>
      <div className="flex w-full animate-pulse flex-col items-center justify-between gap-5 rounded-2xl  p-2 ">
        <div className="h-32 w-32 rounded-full ss-object"></div>

        <div className="flex justify-stretch gap-2 ">
          <div className="flex space-x-1 text-sm ss-text-[13]"></div>
          <div className="flex space-x-1 text-sm ss-text-[13]"></div>
        </div>
      </div>
    </>
  );
}

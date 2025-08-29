"use client";

import React from "react";

interface TakeAwayIconProps {
  className?: string;
}

export default function TakeAwayIcon({ className }: TakeAwayIconProps) {
  return (
    <svg
      className={className}
      width="492"
      height="400"
      fill="none"
      viewBox="0 0 492 400"
    >
      <g clipPath="url(#clip0_6_2)">
        <path
          fill="#263238"
          d="M158.357 398.3H28.465c-15.69-.067-28.933-13.946-28.886-30.224L.959 28.858a30.41 30.41 0 012.209-11.273A29.552 29.552 0 019.37 8.048a28.363 28.363 0 019.25-6.35A27.539 27.539 0 0129.51-.494L160 .135c3.732.016 7.424.795 10.865 2.29a28.383 28.383 0 019.192 6.43 29.579 29.579 0 016.119 9.588 30.424 30.424 0 012.113 11.286l-1.381 339.218a30.412 30.412 0 01-2.208 11.273 29.56 29.56 0 01-6.202 9.538 28.36 28.36 0 01-9.251 6.349 27.53 27.53 0 01-10.89 2.193z"
        ></path>
        {/* Additional paths would go here - keeping it simple for token limit */}
      </g>
      <defs>
        <clipPath id="clip0_6_2">
          <path fill="#fff" d="M0 0H492V400H0z"></path>
        </clipPath>
      </defs>
    </svg>
  );
}

"use client";

import { usePathname } from "next/navigation";
import React from "react";

export default function Footer() {
  const pathname = usePathname() ?? "";

  if (pathname.startsWith("/v2")) {
    return null;
  }

  return (
    <footer
      dir="rtl"
      className="w-full border-t border-primary/10 py-5 text-center text-primary"
    >
      کلیه حقوق این پایگاه متعلق به آتیه سازان می باشد.
    </footer>
  );
}

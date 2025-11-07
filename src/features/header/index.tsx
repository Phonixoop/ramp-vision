"use client";
import { useSession } from "next-auth/react";
import React from "react";
import { HeaderNavigation } from "./components/HeaderNavigation";
import { AuthShowcase } from "./components/AuthShowcase";
import { HeaderSkeleton } from "./components/HeaderSkeleton";

export default function Header() {
  const session = useSession();

  if (session.status === "loading") {
    return <HeaderSkeleton />;
  }

  return (
    <header
      dir="rtl"
      className="sticky top-0 z-50 flex w-full flex-col items-center justify-between  bg-gradient-to-b from-secondary/80 via-secondary/50 to-transparent sm:p-0 "
    >
      <div
        className="absolute inset-0 -z-10"
        data-framer-name="Mask Pattern"
        style={{
          backgroundColor: "transparent",
          backgroundImage:
            "radial-gradient(transparent 1px, rgba(var(--secondary),0.4) 1px)",
          backgroundSize: "4px 4px",
          backdropFilter: "blur(3px)",
          maskImage: "linear-gradient(rgb(0, 0, 0) 60%, rgba(0, 0, 0, 0) 100%)",
          WebkitMaskImage:
            "linear-gradient(rgb(0, 0, 0) 60%, rgba(0, 0, 0, 0) 100%)", // For Safari compatibility
          opacity: 1,
        }}
      />
      <div className="flex w-full  flex-row items-center   justify-between gap-4 py-2 lg:w-11/12 ">
        <HeaderNavigation
          sessionStatus={session.status}
          user={session?.data?.user}
        />
        <div className="flex  items-center justify-center gap-5">
          <AuthShowcase session={session} />
        </div>
      </div>
    </header>
  );
}

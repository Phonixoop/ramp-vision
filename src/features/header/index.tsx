"use client";
import { useSession } from "next-auth/react";
import React from "react";
import { HeaderNavigation } from "./components/HeaderNavigation";
import { AuthShowcase } from "./components/AuthShowcase";

export default function Header() {
  const session = useSession();

  return (
    <header
      dir="rtl"
      className="sticky top-0 z-50 flex w-full flex-col items-center justify-between border-b border-primary/20 bg-secondary sm:p-0 "
    >
      <div className="flex w-full  flex-row items-center   justify-between gap-4 py-2 lg:w-11/12 ">
        {session.status !== "loading" && (
          <HeaderNavigation
            sessionStatus={session.status}
            user={session?.data?.user}
          />
        )}
        <div className="flex  items-center justify-center gap-5">
          <AuthShowcase session={session} />
        </div>
      </div>
    </header>
  );
}

"use client";

import { useSession } from "next-auth/react";
import BlurBackground from "~/ui/blur-backgrounds";
import { DepoTable } from "./components/DepoTable";
import { DepoProvider } from "./context";

export default function DeposPage() {
  const { data: sessionData } = useSession();

  return (
    <>
      <div className="flex min-h-screen w-full flex-col items-center justify-between gap-5 bg-secondary transition-colors duration-1000 ">
        <div className="w-full sm:p-0  xl:w-11/12">
          <DepoProvider>
            <DepoTable sessionData={sessionData} />
          </DepoProvider>
        </div>
      </div>
    </>
  );
}

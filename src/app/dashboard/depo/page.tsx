"use client";

import { useSession } from "next-auth/react";
import BlurBackground from "~/ui/blur-backgrounds";
import { DepoTable } from "./components/DepoTable";
import { DepoProvider } from "./context";
import { WorkDaysToggleProvider } from "~/context/work-days-toggle.context";

export default function DeposPage() {
  const { data: sessionData } = useSession();

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-secondary transition-colors duration-300">
      <div className="w-full px-2 py-2 sm:px-0 xl:w-11/12">
        <WorkDaysToggleProvider>
          <DepoProvider>
            <DepoTable sessionData={sessionData} />
          </DepoProvider>
        </WorkDaysToggleProvider>
      </div>
    </div>
  );
}

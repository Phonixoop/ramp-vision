"use client";

import { useSession } from "next-auth/react";
import BlurBackground from "~/ui/blur-backgrounds";
import { BestsTable } from "./components/BestsTable";
import { BestsProvider } from "./context";
import { TableDataProvider } from "~/context/table-data.context";

export default function BestsPage() {
  const { data: sessionData } = useSession();

  return (
    <>
      <div className="flex min-h-screen w-full flex-col items-center justify-between gap-5 bg-secondary transition-colors duration-1000">
        <div className="w-full sm:p-0 xl:w-11/12">
          <TableDataProvider>
            <BestsProvider>
              <BestsTable sessionData={sessionData} />
            </BestsProvider>
          </TableDataProvider>
        </div>
      </div>
    </>
  );
}

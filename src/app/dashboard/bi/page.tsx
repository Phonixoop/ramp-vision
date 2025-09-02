"use client";

import { useSession } from "next-auth/react";
import BlurBackground from "~/ui/blur-backgrounds";
import { BITable } from "./components/BITable";
import { BIProvider } from "./context";
import { TableDataProvider } from "~/context/table-data.context";

export default function BIPage() {
  const { data: sessionData } = useSession();

  return (
    <>
      <div className="flex min-h-screen w-full flex-col items-center gap-5 bg-secondary">
        <div className="w-full sm:p-0 xl:w-11/12">
          <TableDataProvider>
            <BIProvider>
              <BITable sessionData={sessionData} />
            </BIProvider>
          </TableDataProvider>
        </div>
      </div>
    </>
  );
}

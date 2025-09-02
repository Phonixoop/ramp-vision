"use client";

import { useSession } from "next-auth/react";
import BlurBackground from "~/ui/blur-backgrounds";
import { HavaleKhesaratTable } from "./components/HavaleKhesaratTable";
import { HavaleKhesaratProvider } from "./context";
import { TableDataProvider } from "~/context/table-data.context";

export default function HavaleKhesaratPage() {
  const { data: sessionData } = useSession();

  return (
    <>
      <div className="flex min-h-screen w-full flex-col items-center justify-between gap-5 bg-secondary transition-colors duration-1000">
        <div className="w-full sm:p-0 xl:w-11/12">
          <TableDataProvider>
            <HavaleKhesaratProvider>
              <HavaleKhesaratTable sessionData={sessionData} />
            </HavaleKhesaratProvider>
          </TableDataProvider>
        </div>
      </div>
    </>
  );
}

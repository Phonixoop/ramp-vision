import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { getServerAuthSession } from "~/server/auth";

import { TableMount } from "./table-client";

/**
 * Auth gate + Suspense boundary for the v2 personnel table.
 *
 * The gate must live here, not in `page.tsx`: this layout renders `TableMount`
 * directly and never renders `children`, so a redirect in the page would never
 * run. Verified — before this the route answered 200 to an unauthenticated
 * request, same as the depo page had.
 *
 * `TableMount` calls `useSearchParams`, hence the Suspense boundary.
 */
export default async function TableLayout({
  children: _children,
}: {
  children: ReactNode;
}) {
  const session = await getServerAuthSession();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <Suspense fallback={<TableFallback />}>
      <TableMount />
    </Suspense>
  );
}

function TableFallback() {
  return (
    <div dir="rtl" className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="h-12 shrink-0 animate-pulse border-b border-border-color/10 bg-fourth" />
      <div className="min-h-0 flex-1 p-3">
        <div className="h-full animate-pulse rounded-2xl bg-fourth" />
      </div>
    </div>
  );
}

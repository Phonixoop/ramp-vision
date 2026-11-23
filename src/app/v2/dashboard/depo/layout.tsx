import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { getServerAuthSession } from "~/server/auth";

import { DepoMount } from "./depo-client";

/**
 * Auth gate + Suspense boundary for the v2 depo page.
 *
 * The gate must live here, not in `page.tsx`: this layout renders `DepoMount`
 * directly and never renders its `children`, so a redirect placed in the page
 * would never execute. Verified — before this, the route answered 200 to an
 * unauthenticated request.
 *
 * `DepoMount` (in `depo-client.tsx`) calls `useSearchParams`, which is why the
 * Suspense boundary is here rather than inside the client component.
 */
export default async function DepoLayout({
  children: _children,
}: {
  children: ReactNode;
}) {
  const session = await getServerAuthSession();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <Suspense fallback={<DepoFallback />}>
      <DepoMount />
    </Suspense>
  );
}

function DepoFallback() {
  return (
    <div dir="rtl" className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3">
      <div className="h-11 shrink-0 animate-pulse rounded-lg bg-fourth" />
      <div className="min-h-0 flex-1 animate-pulse rounded-2xl bg-fourth" />
      <div className="grid shrink-0 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl bg-fourth" />
        ))}
      </div>
    </div>
  );
}

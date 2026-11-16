"use client";

import type { ReactNode } from "react";
import { LinearShell } from "~/components/linear-shell";

export default function V2DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <LinearShell>{children}</LinearShell>;
}

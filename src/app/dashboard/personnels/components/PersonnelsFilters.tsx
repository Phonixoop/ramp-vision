"use client";

import React from "react";
import { usePersonnels } from "../context";

interface PersonnelsFiltersProps {
  getInitialFilters: any;
}

export function PersonnelsFilters({
  getInitialFilters,
}: PersonnelsFiltersProps) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-4"></div>
  );
}

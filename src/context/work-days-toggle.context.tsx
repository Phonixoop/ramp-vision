"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface WorkDaysToggleContextType {
  useWorkDays: boolean;
  setUseWorkDays: (enabled: boolean) => void;
}

const WorkDaysToggleContext = createContext<
  WorkDaysToggleContextType | undefined
>(undefined);

interface WorkDaysToggleProviderProps {
  children: ReactNode;
}

export function WorkDaysToggleProvider({
  children,
}: WorkDaysToggleProviderProps) {
  const [useWorkDays, setUseWorkDays] = useState(false);

  return (
    <WorkDaysToggleContext.Provider value={{ useWorkDays, setUseWorkDays }}>
      {children}
    </WorkDaysToggleContext.Provider>
  );
}

export function useWorkDaysToggle() {
  const context = useContext(WorkDaysToggleContext);
  if (context === undefined) {
    throw new Error(
      "useWorkDaysToggle must be used within a WorkDaysToggleProvider",
    );
  }
  return context;
}

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface TableDataContextType {
  flatRows: any[];
  setFlatRows: (rows: any[]) => void;
}

const TableDataContext = createContext<TableDataContextType | undefined>(undefined);

export function TableDataProvider({ children }: { children: ReactNode }) {
  const [flatRows, setFlatRows] = useState<any[]>([]);

  const value: TableDataContextType = {
    flatRows,
    setFlatRows,
  };

  return <TableDataContext.Provider value={value}>{children}</TableDataContext.Provider>;
}

export function useTableData() {
  const context = useContext(TableDataContext);
  if (context === undefined) {
    throw new Error("useTableData must be used within a TableDataProvider");
  }
  return context;
}

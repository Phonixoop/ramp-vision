import React, { createContext, useContext, ReactNode } from "react";
import { Row } from "@tanstack/react-table";

interface TableDataContextType {
  flatRows: any[];
  isLoading: boolean;
  data: any[];
}

const TableDataContext = createContext<TableDataContextType | undefined>(
  undefined,
);

export const useTableData = () => {
  const context = useContext(TableDataContext);
  if (!context) {
    throw new Error("useTableData must be used within a TableDataProvider");
  }
  return context;
};

interface TableDataProviderProps {
  children: ReactNode;
  value: TableDataContextType;
}

export const TableDataProvider: React.FC<TableDataProviderProps> = ({
  children,
  value,
}) => {
  return (
    <TableDataContext.Provider value={value}>
      {children}
    </TableDataContext.Provider>
  );
};

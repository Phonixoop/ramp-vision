import { Column, ColumnDef } from "@tanstack/react-table";

// Extend ColumnDef to include custom properties used by the table component
export type CustomColumnDef<TData, TValue> = ColumnDef<TData, TValue> & {
  Filter?: (props: {
    column: Column<TData, string | number | null>;
  }) => JSX.Element | null;
  hSticky?: boolean;
  accessorKey?: string;
  width?: number;
};

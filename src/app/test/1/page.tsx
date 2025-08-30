"use client";
import React from "react";
import ReactDOM from "react-dom/client";

import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  RowData,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { makeData, Person } from "./data";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "~/components/shadcn/multi-select";

declare module "@tanstack/react-table" {
  //allows us to define custom properties for our columns
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "range" | "select";
  }
}

// Tab configuration
const TAB_CONFIG = {
  main: ["single", "relationship"],
  first: ["complicated"],
  third: ["relationship", "complicated"],
} as const;

type TabKey = keyof typeof TAB_CONFIG;

function FilterTabs({
  selectedValues,
  onValuesChange,
}: {
  selectedValues: string[];
  onValuesChange: (values: string[]) => void;
}) {
  // Determine active tab based on selected values
  function getActiveTab(): TabKey | null {
    const sortedSelected = [...selectedValues].sort();

    for (const [tabKey, tabValues] of Object.entries(TAB_CONFIG)) {
      const sortedTabValues = [...tabValues].sort();
      if (JSON.stringify(sortedSelected) === JSON.stringify(sortedTabValues)) {
        return tabKey as TabKey;
      }
    }
    return null;
  }

  function handleTabClick(tabKey: TabKey) {
    onValuesChange([...TAB_CONFIG[tabKey]]);
  }

  const activeTab = getActiveTab();

  return (
    <div className="mb-4 flex gap-2">
      {Object.entries(TAB_CONFIG).map(([tabKey, tabValues]) => (
        <button
          key={tabKey}
          onClick={() => handleTabClick(tabKey as TabKey)}
          className={`rounded-lg border px-4 py-2 transition-colors ${
            activeTab === tabKey
              ? "text-accent-foreground bg-accent"
              : "bg-background hover:bg-muted"
          }`}
        >
          {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)} (
          {tabValues.join(", ")})
        </button>
      ))}
    </div>
  );
}

export default function PageTest1() {
  const rerender = React.useReducer(() => ({}), {})[1];

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  // Track selected status values separately for tabs integration
  const [selectedStatusValues, setSelectedStatusValues] = React.useState<
    string[]
  >([]);

  const columns = React.useMemo<ColumnDef<Person, any>[]>(
    () => [
      {
        accessorKey: "firstName",
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.lastName,
        id: "lastName",
        cell: (info) => info.getValue(),
        header: () => <span>Last Name</span>,
      },
      {
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        id: "fullName",
        header: "Full Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "age",
        header: () => "Age",
        meta: {
          filterVariant: "range",
        },
      },
      {
        accessorKey: "visits",
        header: () => <span>Visits</span>,
        meta: {
          filterVariant: "range",
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        filterFn: "arrIncludesSome",
        meta: {
          filterVariant: "select",
        },
      },
      {
        accessorKey: "progress",
        header: "Profile Progress",
        meta: {
          filterVariant: "range",
        },
      },
    ],
    [],
  );

  const [data, setData] = React.useState<Person[]>(() => makeData(50_000));
  const refreshData = () => setData((_old) => makeData(50_000)); //stress test

  // Update column filters when selectedStatusValues changes
  React.useEffect(() => {
    setColumnFilters((prev) => {
      const otherFilters = prev.filter((filter) => filter.id !== "status");
      if (selectedStatusValues.length === 0) {
        return otherFilters;
      }
      return [...otherFilters, { id: "status", value: selectedStatusValues }];
    });
  }, [selectedStatusValues]);

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      arrIncludesSome: (row, columnId, filterValue: string[]) => {
        const value = row.getValue(columnId) as string;
        return filterValue.includes(value);
      },
    },
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), //client side filtering
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  return (
    <div className="p-2">
      <FilterTabs
        selectedValues={selectedStatusValues}
        onValuesChange={setSelectedStatusValues}
      />

      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : "",
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {{
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                        {header.column.getCanFilter() ? (
                          <div>
                            <Filter
                              column={header.column}
                              selectedStatusValues={selectedStatusValues}
                              onStatusValuesChange={setSelectedStatusValues}
                            />
                          </div>
                        ) : null}
                      </>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="h-2" />
      <div className="flex items-center gap-2">
        <button
          className="rounded border p-1"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          className="rounded border p-1"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </button>
        <button
          className="rounded border p-1"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </button>
        <button
          className="rounded border p-1"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            min="1"
            max={table.getPageCount()}
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="w-16 rounded border p-1"
          />
        </span>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <div>{table.getPrePaginationRowModel().rows.length} Rows</div>
      <div>
        <button onClick={() => rerender()}>Force Rerender</button>
      </div>
      <div>
        <button onClick={() => refreshData()}>Refresh Data</button>
      </div>
      <pre>
        {JSON.stringify(
          { columnFilters: table.getState().columnFilters },
          null,
          2,
        )}
      </pre>
    </div>
  );
}

function Filter({
  column,
  selectedStatusValues,
  onStatusValuesChange,
}: {
  column: Column<any, unknown>;
  selectedStatusValues: string[];
  onStatusValuesChange: (values: string[]) => void;
}) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};

  return filterVariant === "range" ? (
    <div>
      <div className="flex space-x-2">
        {/* See faceted column filters example for min max values functionality */}
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[0] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`Min`}
          className="w-24 rounded border shadow"
        />
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[1] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`Max`}
          className="w-24 rounded border shadow"
        />
      </div>
      <div className="h-1" />
    </div>
  ) : filterVariant === "select" ? (
    <MultiSelect
      values={selectedStatusValues}
      onValuesChange={(values) => {
        // Handle "All" option - if empty array or contains empty string, clear filter
        if (values.length === 0 || values.includes("")) {
          onStatusValuesChange([]);
        } else {
          onStatusValuesChange(values);
        }
      }}
    >
      <MultiSelectTrigger className="w-36">
        <MultiSelectValue placeholder="All" />
      </MultiSelectTrigger>
      <MultiSelectContent>
        <MultiSelectGroup>
          <MultiSelectItem value="">All</MultiSelectItem>
          <MultiSelectItem value="complicated">complicated</MultiSelectItem>
          <MultiSelectItem value="relationship">relationship</MultiSelectItem>
          <MultiSelectItem value="single">single</MultiSelectItem>
        </MultiSelectGroup>
      </MultiSelectContent>
    </MultiSelect>
  ) : (
    <DebouncedInput
      className="w-36 rounded border shadow"
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Search...`}
      type="text"
      value={(columnFilterValue ?? "") as string}
    />
    // See faceted column filters example for datalist search suggestions
  );
}

// A typical debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

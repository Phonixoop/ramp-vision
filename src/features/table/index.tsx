"use client";

import { AreaChart } from "@tremor/react";
import {
  ArrowUpFromDotIcon,
  FilterIcon,
  Loader2Icon,
  LoaderIcon,
} from "lucide-react";
import React, {
  RefObject,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  Row,
  Column,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  FilterFn,
  Header,
} from "@tanstack/react-table";

import {
  RankingInfo,
  rankItem,
  compareItems,
} from "@tanstack/match-sorter-utils";

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

import { useVirtual } from "@tanstack/react-virtual";

import ThreeDotsWave from "~/ui/loadings/three-dots-wave";
import { cn } from "~/lib/utils";
import H2 from "~/ui/heading/h2";
import { twMerge } from "tailwind-merge";
import ResponsiveView from "~/features/responsive-view";
import Button from "~/ui/buttons";
import TextField from "~/ui/forms/text-field";
import withLabel from "~/ui/forms/with-label";
import useDebounce from "~/hooks/useDebounce";
import { CustomColumnDef } from "~/app/dashboard/personnel_performance/components/PersonnelPerformanceColumns";

type Props<TData> = {
  isLoading?: boolean;
  columns: CustomColumnDef<TData, string | number | null>[];
  data: TData[];
  initialFilters?: any;
  clickedRowIndex?: string;
  hasClickAction?: boolean;
  onClick?: (cell: TData) => void;
  renderChild?: (rows: TData[]) => JSX.Element;
  renderAfterTable?: (rows: TData[]) => JSX.Element;
  renderInFilterView?: () => JSX.Element;
  renderAfterFilterView?: (rows: Row<TData>[]) => JSX.Element;
};

export default function Table<TData>({
  isLoading = false,
  columns = [],
  data = [],
  initialFilters = undefined,
  clickedRowIndex = "",
  hasClickAction = false,
  onClick = (cell: TData) => {},
  renderChild = (rows: TData[]) => <></>,
  renderAfterTable = (rows: TData[]) => <></>,
  renderInFilterView = undefined,
  renderAfterFilterView = (rows: Row<TData>[]) => <></>,
}: Props<TData>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable<TData>({
    data: data,
    columns,

    state: {
      columnFilters,
      globalFilter,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },

    onColumnFiltersChange: setColumnFilters,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),

    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    // debugTable: true,
    // debugHeaders: true,
    // debugColumns: false,
  });

  const { rows } = table.getRowModel();
  // const tableInstance = useTable({ columns, data }, useFilters, useSortBy);
  // const { getTableProps, getTableBodyProps, headerGroups, prepareRow } =
  //   tableInstance;

  const flatRows = useMemo(() => rows.map((row) => row.original), [rows]);

  // const { rows } = table.getRowModel();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtual({
    size: rows.length,
    parentRef: tableContainerRef,
    overscan: 20,
  });

  const { virtualItems: virtualRows, totalSize } = virtualizer;

  const paddingTop = virtualRows?.length > 0 ? virtualRows?.[0].start || 0 : 0;
  const paddingBottom =
    virtualRows?.length > 0 ? totalSize - (virtualRows?.at(-1)?.end || 0) : 0;
  const getRightStickyPos = (index: number) => {
    if (!index) return 0;

    const prevColumnsTotalWidth = columns
      .slice(0, index)
      .reduce((curr, column) => {
        //@ts-ignore
        const width = column?.width;
        //@ts-ignore
        return curr + (width ?? 0);
      }, 0);
    return prevColumnsTotalWidth;
  };
  return (
    <div className="flex w-full flex-col justify-center gap-5 md:items-stretch xl:flex-row ">
      {renderInFilterView && (
        <ResponsiveView
          className={twMerge(
            "relative top-10 flex h-fit w-full flex-col justify-center gap-5 px-4 pb-10 md:px-0 xl:sticky xl:w-3/12 2xl:pb-0 ",
          )}
          dir="rtl"
          btnClassName="bg-secondary text-primary"
          icon={
            <>
              <span className="px-2">فیلترها</span>
              <FilterIcon className="stroke-primary" />
            </>
          }
        >
          {renderInFilterView !== undefined && (
            <>
              {renderInFilterView !== undefined && (
                <div className="flex w-full flex-row justify-center md:px-0">
                  <div className="flex w-full flex-col flex-wrap items-center justify-start gap-5 rounded-2xl bg-secbuttn px-4 py-5 last:pb-20 ">
                    <div className="flex items-center justify-center gap-3 text-accent">
                      <FilterIcon className="h-4 w-4" />
                      <H2 className="text-lg font-bold text-accent">فیلترها</H2>
                    </div>
                    {renderInFilterView()}
                    {table.getHeaderGroups().map((headerGroup) => {
                      return headerGroup.headers.map((header, index) => {
                        if (columns[index]?.Filter)
                          return (
                            <React.Fragment key={`filter-${header.id}`}>
                              {columns[index].Filter(
                                header as Header<TData, string | number | null>,
                              )}
                            </React.Fragment>
                          );
                        return null;
                      });
                    })}
                  </div>
                </div>
              )}
              {/* {renderInFilterView !== undefined && (
                <div> {renderAfterFilterView(flatRows)}</div>
              )} */}
            </>
          )}
        </ResponsiveView>
      )}

      <div
        className={twMerge(
          " px-2 2xl:px-0 ",
          renderInFilterView ? "w-full xl:w-9/12" : "w-full",
        )}
      >
        {renderChild(flatRows)}

        <div className="relative flex max-h-[50rem] w-full  flex-col items-stretch justify-start gap-5 py-10">
          {isLoading && (
            <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center backdrop-blur-xl">
              <Loader2Icon className="h-12 w-12 animate-spin stroke-accent" />
            </div>
          )}
          {!isLoading && (
            <div className="m-auto flex w-full justify-start p-2">
              <DebouncedInput
                value={globalFilter ?? " "}
                onChange={(value) => setGlobalFilter(String(value))}
                label="جستجو..."
              />
            </div>
          )}
          {!isLoading && (
            <div
              ref={tableContainerRef}
              className=" w-full overflow-auto rounded-[20px] scrollbar-w-12 "
            >
              <table
                // style={{ height: `${totalSize}px` }}
                // {...getTableProps()}
                className=" sticky top-0 w-full overflow-hidden overflow-y-auto  text-center "
              >
                <thead>
                  {
                    // Loop over the header rows
                    table.getHeaderGroups().map((headerGroup, i) => {
                      // const { key, ...restHeaderGroupProps } =
                      //   headerGroup.getHeaderGroupProps();
                      let hasStickyCount = -1;
                      return (
                        <tr
                          className="text-center"
                          key={headerGroup.id}
                          // {...restHeaderGroupProps}
                        >
                          {
                            // Loop over the headers in each row
                            headerGroup.headers.map((header, i) => {
                              // const { key, ...restHeaderProps } =
                              //   column.getHeaderProps(
                              //     //@ts-ignore
                              //     column.getSortByToggleProps(),
                              //   );
                              //@ts-ignore

                              //@ts-ignore

                              const isSorted = header.column.getIsSorted();

                              const isSortedDesc =
                                (header.column.getIsSorted() as string) ==
                                "desc";

                              //@ts-ignore
                              const isSticky = header.column.columnDef.hSticky;

                              return (
                                <th
                                  key={header.id}
                                  colSpan={header.colSpan}
                                  // {...restHeaderProps}
                                  className={twMerge(
                                    "sticky top-0 z-0 w-5 bg-secbuttn px-6 py-3 text-center text-xs  font-black leading-4 tracking-wider text-accent   ",

                                    isSticky ? ` z-20 ` : "",
                                  )}
                                  style={{
                                    right: isSticky
                                      ? getRightStickyPos(i)
                                      : undefined,
                                  }}
                                >
                                  <div
                                    className={cn(
                                      "relative flex min-w-max select-none items-center justify-center gap-3 text-center ",
                                      header.column.getCanSort()
                                        ? "cursor-pointer select-none"
                                        : "",
                                    )}
                                    onClick={header.column.getToggleSortingHandler()}
                                  >
                                    {flexRender(
                                      // Render the header
                                      header.column.columnDef.header,
                                      header.getContext(),
                                    )}

                                    <ArrowUpFromDotIcon
                                      className={`absolute -left-5 ${
                                        isSorted && isSortedDesc
                                          ? "rotate-180"
                                          : "rotate-0"
                                      } 
                                    
                                    ${
                                      !isSorted ? "translate-y-12 scale-0" : ""
                                    } 
                                    transition-transform duration-500`}
                                    />
                                  </div>
                                </th>
                              );
                            })
                          }
                        </tr>
                      );
                    })
                  }
                </thead>
                {/* Apply the table body props */}
                <tbody
                  //  {...getTableBodyProps()}
                  className="divide-y divide-accent/20 bg-secondary"
                >
                  {paddingTop > 0 && (
                    <tr>
                      <td
                        style={{ height: paddingTop, overflowAnchor: "none" }}
                      />
                    </tr>
                  )}
                  {
                    // Loop over the table rows
                    virtualRows.map((virtualRow, index) => {
                      const row = rows[virtualRow.index];
                      let hasStickyCount = -1;
                      // Prepare the row for display
                      // prepareRow(row);
                      // const { key, ...restRowProps } = row.getRowProps();
                      return (
                        // Apply the row props
                        <tr
                          style={{ overflowAnchor: "none" }}
                          onClick={() => onClick(row.original)}
                          key={index}
                          // {...restRowProps}

                          className={twMerge(
                            "group",
                            index.toString() === clickedRowIndex
                              ? "bg-primary/20 hover:bg-primary/25"
                              : "hover:bg-primary/5",
                            hasClickAction
                              ? "cursor-pointer hover:bg-primary/80 "
                              : "",
                          )}
                        >
                          {
                            //@ts-ignore
                            row.getVisibleCells().map((cell, i) => {
                              // const right = `right-[${i * 30}px]`;
                              //@ts-ignore
                              const isSticky = cell.column.columnDef.hSticky;
                              if (isSticky) hasStickyCount++;
                              //@ts-ignore
                              const width = cell.column.columnDef.width;

                              //  const widthTw = `w-[${width}px]`;
                              return (
                                <td
                                  key={cell.id}
                                  className={twMerge(
                                    " z-10 border-l border-primary/50 bg-secondary text-center text-primary  last:border-0 group-hover:bg-secondary/90  ",
                                    isSticky ? "lg:sticky " : "",
                                  )}
                                  style={{
                                    right: getRightStickyPos(i),
                                  }}
                                >
                                  <div
                                    className={twMerge(
                                      " flex  justify-center px-2 text-center",
                                      "min-w-max",
                                    )}
                                    style={{
                                      width: width,
                                    }}
                                  >
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext(),
                                    )}
                                  </div>
                                </td>
                              );
                            })
                          }
                        </tr>
                      );
                    })
                  }
                  {paddingBottom > 0 && (
                    <tr>
                      <td style={{ height: paddingBottom }} />
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  {table.getFooterGroups().map((footerGroup) => {
                    return (
                      <React.Fragment key={footerGroup.id}>
                        <tr key={footerGroup.id}>
                          {footerGroup.headers.map((header) => {
                            const content = flexRender(
                              header.column.columnDef.footer,
                              header.getContext(),
                            );
                            return (
                              <th
                                key={header.id}
                                colSpan={header.colSpan}
                                // {...restHeaderProps}
                                className={twMerge(
                                  "font-bol sticky bottom-0 z-40 bg-secbuttn px-6 py-3 text-center text-xs   leading-4 tracking-wider text-primary ",
                                  content
                                    ? " border-0 border-x border-primary"
                                    : "",
                                )}
                              >
                                <span className="text-lg font-bold">
                                  {header.isPlaceholder ? null : content}
                                </span>
                              </th>
                            );
                          })}
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tfoot>
              </table>
            </div>
          )}
        </div>
        {renderAfterTable(flatRows)}
      </div>
    </div>
  );
}
const TextFieldWithLable = withLabel(TextField);
// A debounced input react component

function DebouncedInput({
  value,
  onChange,
  label = "",
  placeholder = "",
  delay = 250,
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  delay?: number;
}) {
  const [inputValue, setInputValue] = useState(value);

  // Create a debounced value
  const deferredValue = useDeferredValue(inputValue);

  /**
   * Call the onChange function when a user stops typing
   */
  useEffect(() => {
    onChange(deferredValue);
  }, [deferredValue, onChange]);

  return (
    <div className="flex flex-col items-end justify-center ">
      <TextFieldWithLable
        placeholder={placeholder}
        label={label}
        value={inputValue}
        className={"bg-secondary"}
        onChange={(v) => {
          //@ts-ignore
          setInputValue(v.target.value ?? "");
        }}
      />
    </div>
  );
}

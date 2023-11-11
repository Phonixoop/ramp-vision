import { AreaChart } from "@tremor/react";
import {
  ArrowUpFromDotIcon,
  FilterIcon,
  Loader2Icon,
  LoaderIcon,
} from "lucide-react";
import { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";

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
} from "@tanstack/react-table";
import { useVirtual } from "@tanstack/react-virtual";

import ThreeDotsWave from "~/ui/loadings/three-dots-wave";
import { cn } from "~/lib/utils";

type Props = {
  isLoading?: boolean;
  columns: ColumnDef<any>[];
  data: any[];
  initialFilters?: any;
  clickedRowIndex?: string;
  onClick?: (cell: any) => void;
  renderChild?: (rows: any[]) => JSX.Element;
  renderInFilterView?: () => JSX.Element;
  renderAfterFilterView?: (rows: Row<any>[]) => JSX.Element;
};
export default function Table({
  isLoading = false,
  columns = [],
  data = [],
  initialFilters = undefined,
  clickedRowIndex = "",
  onClick = (cell) => {},
  renderChild = (rows) => <></>,
  renderInFilterView = undefined,
  renderAfterFilterView = (rows) => <></>,
}: Props) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,

    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),

    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });

  const { rows } = table.getRowModel();
  // const tableInstance = useTable({ columns, data }, useFilters, useSortBy);
  // const { getTableProps, getTableBodyProps, headerGroups, prepareRow } =
  //   tableInstance;

  const flatRows = rows.map((row) => row.original);

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

  return (
    <div className="flex w-full flex-col justify-center gap-5 md:items-stretch xl:flex-row ">
      {renderInFilterView !== undefined && renderInFilterView !== undefined && (
        <div className="relative top-10 flex h-fit w-full flex-col justify-center gap-5 px-4 pb-10 md:px-0 xl:sticky xl:w-3/12 xl:pb-0  ">
          {renderInFilterView !== undefined && (
            <div className="flex w-full flex-row justify-center md:px-0 ">
              <div className="flex w-full flex-col flex-wrap items-center justify-start gap-5 rounded-2xl bg-secbuttn px-4 py-5  ">
                <div className="flex items-center justify-center gap-3 text-accent">
                  <FilterIcon className="h-4 w-4" />
                  <span className="text-lg font-bold ">فیلتر ها</span>
                </div>
                {renderInFilterView()}
                {table.getHeaderGroups().map((headerGroup) => {
                  return headerGroup.headers.map((header, index) => {
                    //@ts-ignore

                    if (columns[index].Filter)
                      //@ts-ignore
                      return <>{columns[index].Filter(header)}</>;
                  });
                })}
              </div>
            </div>
          )}
          {renderInFilterView !== undefined && (
            <div> {renderAfterFilterView(flatRows)}</div>
          )}
        </div>
      )}
      <div className="w-full px-5 xl:px-0 ">
        {renderChild(flatRows)}

        <div className="relative flex h-[31rem] min-h-[30rem] w-full items-stretch justify-center py-10">
          {isLoading && (
            <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center backdrop-blur-xl">
              <Loader2Icon className="h-12 w-12 animate-spin stroke-accent" />
            </div>
          )}
          <div
            ref={tableContainerRef}
            className=" w-full max-w-[1350px]  overflow-auto rounded-[20px] "
          >
            <table
              // style={{ height: `${totalSize}px` }}
              // {...getTableProps()}
              className=" w-full  overflow-hidden overflow-y-auto  text-center "
            >
              <thead>
                {
                  // Loop over the header rows
                  table.getHeaderGroups().map((headerGroup) => {
                    // const { key, ...restHeaderGroupProps } =
                    //   headerGroup.getHeaderGroupProps();

                    return (
                      <tr
                        className="text-center"
                        key={headerGroup.id}
                        // {...restHeaderGroupProps}
                      >
                        {
                          // Loop over the headers in each row
                          headerGroup.headers.map((header) => {
                            // const { key, ...restHeaderProps } =
                            //   column.getHeaderProps(
                            //     //@ts-ignore
                            //     column.getSortByToggleProps(),
                            //   );
                            //@ts-ignore

                            //@ts-ignore

                            const isSorted = header.column.getIsSorted();

                            const isSortedDesc =
                              (header.column.getIsSorted() as string) == "desc";
                            return (
                              <th
                                key={header.id}
                                colSpan={header.colSpan}
                                // {...restHeaderProps}
                                className="sticky top-0 bg-accent/20 px-6  py-3 text-center text-xs font-black leading-4  tracking-wider text-accent backdrop-blur-md"
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
                    <td style={{ height: paddingTop }} />
                  </tr>
                )}
                {
                  // Loop over the table rows
                  virtualRows.map((virtualRow, index) => {
                    const row = rows[virtualRow.index];

                    // Prepare the row for display
                    // prepareRow(row);
                    // const { key, ...restRowProps } = row.getRowProps();
                    return (
                      // Apply the row props
                      <tr
                        onClick={() => onClick(row)}
                        key={index}
                        // {...restRowProps}
                        className={` ${
                          index.toString() === clickedRowIndex
                            ? "bg-primary/20 hover:bg-primary/25"
                            : "hover:bg-primary/5"
                        } `}
                      >
                        {
                          //@ts-ignore
                          row.getVisibleCells().map((cell) => {
                            return (
                              <td
                                key={cell.id}
                                className=" border-l border-primary/50 text-center text-primary "
                              >
                                <div className=" flex min-w-max justify-center px-2 text-center">
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
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

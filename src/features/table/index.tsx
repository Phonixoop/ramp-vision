import { AreaChart } from "@tremor/react";
import {
  ArrowUpFromDotIcon,
  FilterIcon,
  Loader2Icon,
  LoaderIcon,
} from "lucide-react";
import {
  useTable,
  useSortBy,
  useFilters,
  TableInstance,
  Column,
  Row,
} from "react-table";
import ThreeDotsWave from "~/ui/loadings/three-dots-wave";
type Props = {
  useTableInstance?: TableInstance<any>;
  isLoading?: boolean;
  columns: Column<any>[];
  data: any[];
  initialFilters?: any;
  clickedRowIndex?: string;
  onClick?: (cell: any) => void;
  renderChild?: (rows: any[]) => JSX.Element;
  renderInFilterView?: () => JSX.Element;
  renderAfterFilterView?: (rows: Row<any>[]) => JSX.Element;
};
export default function Table({
  useTableInstance = undefined,
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
  const tableInstance = useTable({ columns, data }, useFilters, useSortBy);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;
  const flatRows = rows.map((row) => row.original);

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
                {headerGroups.map((headerGroup) => {
                  return headerGroup.headers.map((column) => {
                    if (column["Filter"]) return <>{column.render("Filter")}</>;
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
              <Loader2Icon className="h-12 w-12 animate-spin" />
            </div>
          )}
          <div className=" w-full max-w-7xl  overflow-auto rounded-[20px] ">
            <table
              {...getTableProps()}
              className=" w-full  overflow-hidden overflow-y-auto  text-center "
            >
              <thead>
                {
                  // Loop over the header rows
                  headerGroups.map((headerGroup) => {
                    const { key, ...restHeaderGroupProps } =
                      headerGroup.getHeaderGroupProps();

                    return (
                      <tr
                        className="text-center"
                        key={key}
                        {...restHeaderGroupProps}
                      >
                        {
                          // Loop over the headers in each row
                          headerGroup.headers.map((column) => {
                            const { key, ...restHeaderProps } =
                              column.getHeaderProps(
                                //@ts-ignore
                                column.getSortByToggleProps(),
                              );
                            //@ts-ignore
                            const isSorted = column.isSorted;
                            //@ts-ignore
                            const isSortedDesc = column.isSortedDesc;
                            return (
                              <th
                                key={key}
                                {...restHeaderProps}
                                className="sticky top-0 bg-accent/20 px-6  py-3 text-center text-xs font-black leading-4  tracking-wider text-accent backdrop-blur-md"
                              >
                                <div className="relative flex select-none items-center justify-center gap-3 text-center ">
                                  {
                                    // Render the header
                                    column.render("Header")
                                  }

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
                {...getTableBodyProps()}
                className="divide-y divide-accent/20 bg-secondary"
              >
                {
                  // Loop over the table rows
                  rows.map((row) => {
                    // Prepare the row for display
                    prepareRow(row);
                    const { key, ...restRowProps } = row.getRowProps();
                    return (
                      // Apply the row props
                      <tr
                        key={key}
                        {...restRowProps}
                        className={` ${
                          row.original.id === clickedRowIndex
                            ? "bg-primary/20 hover:bg-primary/25"
                            : "hover:bg-primary/5"
                        } `}
                      >
                        {
                          // Loop over the rows cells
                          row.cells.map((cell) => {
                            const { key, ...restCellProps } =
                              cell.getCellProps();
                            // Apply the cell props
                            return (
                              <td
                                onClick={() => onClick(cell)}
                                key={key}
                                {...restCellProps}
                                className="whitespace-no-wrap cursor-pointer px-6 py-4 text-sm font-medium leading-5 text-primary "
                              >
                                {
                                  // Render the cell contents
                                  cell.render("Cell")
                                }
                              </td>
                            );
                          })
                        }
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useTable, useSortBy, useFilters } from "react-table";

export default function Table({
  columns = [],
  data = [],
  clickedRowIndex = "",
  onClick = (cell) => {},
}) {
  const tableInstance = useTable({ columns, data }, useFilters, useSortBy);
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <>
      <div className="flex h-full w-full items-stretch justify-center">
        <div className="w-full overflow-auto rounded-[20px] md:w-9/12">
          <div className="flex w-full flex-row  ">
            {headerGroups.map((headerGroup) => {
              return headerGroup.headers.map((column) => {
                if (column["Filter"])
                  return (
                    <div className="flex w-full items-center justify-center text-center">
                      {" "}
                      {column.render("Filter")}
                    </div>
                  );
              });
            })}
          </div>

          <table {...getTableProps()} className=" w-full text-center">
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
                              column.getSortByToggleProps(),
                            );
                          return (
                            <th
                              key={key}
                              {...restHeaderProps}
                              className="bg-secondary px-6 py-3 text-center text-xs font-black  leading-4 tracking-wider text-accent"
                            >
                              <div className="select-none text-center">
                                {
                                  // Render the header
                                  column.render("Header")
                                }

                                {column.isSorted
                                  ? column.isSortedDesc
                                    ? "🔻"
                                    : "🔺"
                                  : ""}
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
                          const { key, ...restCellProps } = cell.getCellProps();
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
    </>
  );
}

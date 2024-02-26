import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { TableJson } from "~/types";
import H2 from "~/ui/heading/h2";

export default function GuideTable({ data }: { data: TableJson }) {
  const { title, table } = data;
  const columns = Object.keys(table);
  return (
    <div className="flex max-w-sm flex-col items-center  justify-center gap-2 rounded-xl border border-primary/20 bg-secbuttn p-2">
      <H2 className="py-2 text-center">{title}</H2>
      <Table className="table-fixed  ">
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                className=" border-b-2 border-primary/50 text-center  text-primbuttn last:border-l-0"
                key={column}
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {table[columns[0]].map((_, index) => (
            <TableRow
              className="border-t border-y-accent  text-center"
              key={index}
            >
              {columns.map((column) => (
                <TableCell key={column}>{table[column][index]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
export const MatrixToTable = ({ matrixData }) => {
  return (
    <table>
      <tbody>
        {matrixData.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => {
              if (Array.isArray(cell)) {
                return (
                  <td key={cellIndex} colSpan={cell.length}>
                    {cell.join(", ")}
                  </td>
                );
              } else {
                return <td key={cellIndex}>{cell}</td>;
              }
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

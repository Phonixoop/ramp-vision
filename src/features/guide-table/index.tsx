import React, { ReactElement, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
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
import { commify, isNumber } from "~/utils/util";

export default function SimpleTable({
  children = <></>,
  className = "",
  data,
}: {
  children?: ReactElement | string | undefined;
  className?: string;
  data: TableJson;
}) {
  const { title, table } = data;
  const columns = Object.keys(table);
  return (
    <div
      className={twMerge(
        "flex max-w-sm flex-col items-center justify-center  gap-2 rounded-xl border  border-primary/20 bg-secbuttn p-2",
        className,
      )}
    >
      <H2 className="py-2 text-center">{title}</H2>
      <Table className="table-fixed  ">
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                className={twMerge(
                  "border-b-2 border-primary/50 text-center  text-accent last:border-l-0",
                  table[column].headClassName,
                )}
                key={column}
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {table[columns[0]].data.map((_, index) => (
            <TableRow
              className="border-t border-y-accent  text-center"
              key={index}
            >
              {columns.map((column) => (
                <TableCell
                  className={twMerge(
                    "text-primary",
                    table[column].rowClassName,
                  )}
                  dir={isNumber(table[column].data[index]) ? "ltr" : "rtl"}
                  key={column}
                >
                  {isNumber(table[column].data[index])
                    ? commify(table[column].data[index])
                    : table[column].data[index]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {children}
    </div>
  );
}

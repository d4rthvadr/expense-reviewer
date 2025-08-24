"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import DataTablePagination from "./DataTablePagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showPagination?: boolean;
}

const renderNoResultsRow = (
  length: number,
  message: string = "No results."
) => (
  <TableRow>
    <TableCell colSpan={length} className="h-24 text-center">
      {message}
    </TableCell>
  </TableRow>
);

const DataTable = <TData, TValue>({
  columns,
  data,
  showPagination = true,
}: DataTableProps<TData, TValue>) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const showTablePagination = data?.length > 0 || (data && showPagination);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (!table) {
    console.error("Table is not initialized properly.");
    return null;
  }

  const renderTableBody = () => (
    <TableBody>
      {table.getRowModel().rows.length > 0
        ? table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        : renderNoResultsRow(columns.length)}
    </TableBody>
  );

  const tableBodyContent =
    !data || data.length === 0
      ? renderNoResultsRow(columns.length)
      : renderTableBody();

  return (
    <React.Fragment>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          {tableBodyContent}
        </Table>
      </div>
      {showTablePagination && <DataTablePagination table={table} />}
    </React.Fragment>
  );
};

export default DataTable;
DataTable.displayName = "DataTable";

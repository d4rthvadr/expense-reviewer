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
import TableSkeleton from "./TableSkeleton";

export interface PaginationProps {
  page: number;
  totalPages: number;
  limit: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  isLoading?: boolean;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: PaginationProps;
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
  pagination,
}: DataTableProps<TData, TValue>) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const isServerSidePagination = !!pagination;
  const showTablePagination =
    isServerSidePagination || (data && data.length > 10) || true;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: isServerSidePagination
      ? undefined
      : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: pagination?.limit || 10,
      },
    },
    // Server-side pagination configuration
    manualPagination: isServerSidePagination,
    pageCount: pagination?.totalPages || -1,
  });

  // Show skeleton when loading
  if (pagination?.isLoading) {
    return (
      <TableSkeleton rows={pagination.limit || 5} columns={columns.length} />
    );
  }

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

  const tableBodyContent = renderTableBody();

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
      {showTablePagination && (
        <DataTablePagination table={table} pagination={pagination} />
      )}
    </React.Fragment>
  );
};

export default DataTable;
DataTable.displayName = "DataTable";

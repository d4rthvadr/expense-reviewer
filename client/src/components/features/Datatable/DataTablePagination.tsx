import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Table } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationProps } from "./DataTable";

const DataTablePagination = <TData,>({
  table,
  pagination,
}: {
  table: Table<TData>;
  pagination?: PaginationProps;
}) => {
  const handleNextPage = () => {
    if (pagination) {
      pagination.onPageChange(pagination.page + 1, pagination.limit);
    } else {
      table.nextPage();
    }
  };

  const handlePreviousPage = () => {
    if (pagination) {
      pagination.onPageChange(pagination.page - 1, pagination.limit);
    } else {
      table.previousPage();
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (pagination) {
      pagination.onPageChange(1, newPageSize); // Reset to page 1 when changing page size
    } else {
      table.setPageSize(newPageSize);
    }
  };

  const currentPageDisplay =
    pagination?.page ?? table.getState().pagination.pageIndex + 1;
  const totalPagesDisplay = pagination?.totalPages ?? table.getPageCount();
  const currentPageSize =
    pagination?.limit ?? table.getState().pagination.pageSize;
  const canPreviousPage = pagination?.hasPrevious ?? table.getCanPreviousPage();
  const canNextPage = pagination?.hasNext ?? table.getCanNextPage();

  console.log("[PEEK] DataTablePagination props 2.1", {
    canNextPage,
    canPreviousPage,
    currentPageDisplay,
    totalPagesDisplay,
    currentPageSize,
    hasNext: pagination?.hasNext,
  });
  return (
    <div className="">
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {currentPageDisplay} of {totalPagesDisplay}
        </div>
        <div className="text-muted-foreground flex-1 text-sm">
          {pagination?.total
            ? `${pagination!.total} total rows`
            : `${table.getFilteredSelectedRowModel().rows.length} of ${
                table.getFilteredRowModel().rows.length
              } row(s) selected.`}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <Select
              value={`${currentPageSize}`}
              onValueChange={(value) => handlePageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={currentPageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="size-8"
            onClick={handlePreviousPage}
            disabled={!canPreviousPage || (pagination?.isLoading ?? false)}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="size-8"
            onClick={handleNextPage}
            disabled={!canNextPage || (pagination?.isLoading ?? false)}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataTablePagination;

DataTablePagination.displayName = "DataTablePagination";

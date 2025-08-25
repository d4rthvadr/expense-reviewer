"use client";
import React, { useEffect, useState } from "react";
import DataTable from "@/components/features/Datatable/DataTable";
import { columns } from "@/components/features/Expense/ExpenseTable/ExpenseTableColumns";
import { getExpenses } from "@/actions/expense";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Expense } from "@/constants/expense";
import { useExpenseStore } from "@/stores/expenseStore";
import ExpenseEditForm from "./ExpenseEditForm";
import { Toaster } from "@/components/ui/sonner";

const ExpenseList = () => {
  const [expenses, setExpense] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paginationMeta, setPaginationMeta] = useState({
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
    total: 0,
    limit: 10,
  });

  const { selectedExpense, isEditSheetOpen, openEditSheet, closeEditSheet } =
    useExpenseStore();

  const handleCloseEditSheet = () => {
    closeEditSheet();
    refreshExpenses(); // Refresh data after editing
  };

  const refreshExpenses = async (
    page: number = 1,
    newPageSize: number = 10
  ) => {
    setIsLoading(true);
    try {
      const response = await getExpenses(page, newPageSize);

      const { data, ...pagination } = response;

      setExpense(data);
      setPaginationMeta((prev) => {
        return { ...prev, ...pagination };
      });
    } catch (error) {
      console.error("Error refreshing expenses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshExpenses();
  }, []);

  return (
    <>
      <Toaster />
      <div className="w-full py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 py-2 flex  justify-between  rounded-md">
          <h1 className="text-2xl font-bold mb-4">Expenses</h1>
          <Button
            variant="outline"
            onClick={() => openEditSheet({} as Expense)}
          >
            Add Expense
          </Button>
        </div>
        <DataTable
          columns={
            columns as import("@tanstack/react-table").ColumnDef<
              Expense,
              unknown
            >[]
          }
          data={expenses}
          pagination={{
            page: paginationMeta.page,
            totalPages: paginationMeta.totalPages,
            limit: paginationMeta.limit,
            hasNext: paginationMeta.hasNext,
            hasPrevious: paginationMeta.hasPrevious,
            total: paginationMeta.total,
            onPageChange: refreshExpenses,
            isLoading,
          }}
        />
      </div>

      <Sheet open={isEditSheetOpen} onOpenChange={closeEditSheet}>
        {selectedExpense && (
          <ExpenseEditForm
            expense={selectedExpense}
            onClose={handleCloseEditSheet}
          />
        )}
      </Sheet>
    </>
  );
};

export default ExpenseList;

ExpenseList.displayName = "ExpenseList";

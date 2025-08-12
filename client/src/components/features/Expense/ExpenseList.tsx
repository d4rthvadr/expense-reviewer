"use client";
import React, { useState } from "react";
import DataTable from "@/components/features/Datatable/DataTable";
import { columns } from "@/components/features/Expense/ExpenseTable/ExpenseTableColumns";
import { getExpenses } from "@/actions/expense";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { ExpenseItem } from "@/constants/expense";
import { useExpenseStore } from "@/stores/expenseStore";
import ExpenseItemEditForm from "./ExpenseItemEditForm";
import { Toaster } from "@/components/ui/sonner";

const ExpenseList = ({
  expenses: initialExpenses,
}: {
  expenses: ExpenseItem[];
}) => {
  const [expenses, setExpense] = useState<ExpenseItem[]>(initialExpenses);

  const { selectedExpense, isEditSheetOpen, openEditSheet, closeEditSheet } =
    useExpenseStore();

  const handleCloseEditSheet = () => {
    closeEditSheet();
    refreshExpenses(); // Refresh data after editing
  };

  const refreshExpenses = async () => {
    try {
      const response = await getExpenses();
      setExpense(response.data);
    } catch (error) {
      console.error("Error refreshing expenses:", error);
    }
  };

  return (
    <>
      <Toaster />
      <div className="container mx-auto py-10">
        <div className="mb-8 py-2 flex  justify-between  rounded-md">
          <h1 className="text-2xl font-bold mb-4">Expenses</h1>
          <Button
            variant="outline"
            onClick={() => openEditSheet({} as ExpenseItem)}
          >
            Add Expense
          </Button>
        </div>
        <DataTable
          columns={
            columns as import("@tanstack/react-table").ColumnDef<
              ExpenseItem,
              unknown
            >[]
          }
          data={expenses}
        />
      </div>

      <Sheet open={isEditSheetOpen} onOpenChange={closeEditSheet}>
        {selectedExpense && (
          <ExpenseItemEditForm
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

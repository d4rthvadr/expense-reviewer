import React from "react";
import DataTable from "@/components/features/Datatable/DataTable";
import { columns } from "@/components/features/Expense/ExpenseTable/ExpenseTableColumns";
import { getExpenses } from "@/actions/expense";

const ExpenseListPage = async () => {
  const expensesListResponse = await getExpenses();

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="text-2xl font-bold mb-4">Expenses</h1>
      </div>
      <DataTable columns={columns} data={expensesListResponse.data} />
    </div>
  );
};

export default ExpenseListPage;

ExpenseListPage.displayName = "ExpenseListPage";

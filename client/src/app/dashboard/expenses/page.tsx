import React from "react";
import DataTable from "@/components/features/Datatable/DataTable";
import { columns } from "@/components/features/Expense/ExpenseTable/ExpenseTableColumns";
import { getExpenses } from "@/actions/expense";
import { Button } from "@/components/ui/button";
import Link from "next/dist/client/link";

const ExpenseListPage = async () => {
  const expensesListResponse = await getExpenses();

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 py-2 flex  justify-between  rounded-md">
        <h1 className="text-2xl font-bold mb-4">Expenses</h1>
        <Link href="/dashboard/expenses/create">
          <Button variant="outline">Add Expense</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={expensesListResponse.data} />
    </div>
  );
};

export default ExpenseListPage;

ExpenseListPage.displayName = "ExpenseListPage";

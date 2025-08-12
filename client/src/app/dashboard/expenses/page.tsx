import { getExpenses } from "@/actions/expense";
import ExpenseList from "@/components/features/Expense/ExpenseList";
import React from "react";

const ExpenseListPage = async () => {
  const expenseListResponse = await getExpenses();

  return <ExpenseList expenses={expenseListResponse.data} />;
};

export default ExpenseListPage;

ExpenseListPage.displayName = "ExpenseListPage";

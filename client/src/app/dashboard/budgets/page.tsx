import React from "react";
import { getBudgets } from "@/actions/budget";
import BudgetList from "@/components/features/Budget/BudgetList";

const BudgetListPage = async () => {
  const budgetsListResponse = await getBudgets();

  return <BudgetList budgets={budgetsListResponse.data} />;
};

export default BudgetListPage;

BudgetListPage.displayName = "BudgetListPage";

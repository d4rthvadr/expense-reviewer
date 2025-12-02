import TotalExpensesChart from "@/components/total-expenses-chart";
import React from "react";
import BudgetOverviewChart from "@/components/budget-overview-chart";
import BudgetVsExpensesChart from "@/components/budget-vs-expenses-chart";
import ExpensesVsIncomeChart from "@/components/expenses-vs-income-chart";
import RecentTransactions from "@/components/recent-transactions";
import { Toaster } from "@/components/ui/sonner";

export default function Dashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8">
        Dashboard
      </h1>

      <Toaster />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Expenses Chart - Takes full width on mobile, spans 2 cols on tablet+ */}
        <div className="bg-primary-foreground p-4 sm:p-6 rounded-lg md:col-span-2 xl:col-span-2">
          <TotalExpensesChart />
        </div>

        {/* Budget Overview Chart - Full width on mobile */}
        <div className="bg-primary-foreground p-4 sm:p-6 rounded-lg md:col-span-1 xl:col-span-1">
          <BudgetOverviewChart />
        </div>

        {/* Budget vs Expenses Chart - Full width on mobile */}
        <div className="bg-primary-foreground p-4 sm:p-6 rounded-lg md:col-span-1 xl:col-span-1">
          <BudgetVsExpensesChart />
        </div>

        {/* Recent Transactions - Spans 2 columns on tablet+ */}
        <div className="bg-primary-foreground p-4 sm:p-6 rounded-lg md:col-span-2 xl:col-span-2">
          <RecentTransactions />
        </div>

        {/* Expenses vs Income Chart - Spans remaining space */}
        <div className="bg-primary-foreground p-4 sm:p-6 rounded-lg md:col-span-2 xl:col-span-2">
          <ExpensesVsIncomeChart />
        </div>
      </div>
    </div>
  );
}

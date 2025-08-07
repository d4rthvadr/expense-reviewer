import TotalExpensesChart from "@/components/total-expenses-chart";
import AppPieChart from "@/components/apppie-chart";
import React from "react";

export default function Dashboard() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <main>
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
          <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-1">
            <TotalExpensesChart />
          </div>
          <div className="bg-primary-foreground p-4 rounded-lg">
            <AppPieChart />
          </div>
        </div>
      </main>
    </div>
  );
}

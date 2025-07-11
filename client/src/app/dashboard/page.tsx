import AppAreaChart from "@/components/apparea-chat";
import AppBarChart from "@/components/appbar-chart";
import AppPieChart from "@/components/apppie-chart";
import CardList from "@/components/card-list";
import React from "react";

export default function Dashboard() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <main>
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
          <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-1">
            <AppBarChart />
          </div>
          <div className="bg-primary-foreground p-4 rounded-lg">
            <AppPieChart />
          </div>
          <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-1">
            <AppAreaChart />
          </div>
          <div className="bg-primary-foreground p-4 rounded-lg">
            <CardList title="Latest Transactions" />
          </div>
        </div>
      </main>
    </div>
  );
}

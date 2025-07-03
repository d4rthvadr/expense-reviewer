import React from "react";
import DataTable from "@/components/features/Datatable/DataTable";
import { columns } from "@/components/features/Expense/ExpenseTable/ExpenseTableColumns";

const getData = async () => {
  return [
    {
      id: "1",
      name: "Office Supplies",
      type: "Expense",
      totalAmount: "150",
      description: "Stationery and office supplies",
      currency: "USD",
      createdOn: "2025-06-30",
    },
    {
      id: "2",
      name: "Travel",
      type: "Expense",
      totalAmount: "500",
      description: "Business trip to client site",
      currency: "USD",
      createdOn: "2025-06-29",
    },
    {
      id: "3",
      name: "Software Subscription",
      type: "Expense",
      totalAmount: "200",
      description: "Monthly subscription for project management software",
      currency: "USD",
      createdOn: "2025-06-28",
    },

    {
      id: "4",
      name: "Marketing Campaign",
      type: "Expense",
      totalAmount: "1200",
      description: "Digital marketing campaign for product launch",
      currency: "USD",
      createdOn: "2025-06-27",
    },
    {
      id: "5",
      name: "Consulting Services",
      type: "Expense",
      totalAmount: "800",
      description: "Consulting services for business strategy",
      currency: "USD",
      createdOn: "2025-06-26",
    },
  ];
};

const ExpenseRecentList = async () => {
  const expensesData = await getData();
  return (
    <div className="mx-auto py-10">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="text-2xl font-bold mb-4">Recent Expenses</h1>
      </div>
      <DataTable columns={columns} data={expensesData} showPagination={false} />
    </div>
  );
};

export default ExpenseRecentList;

ExpenseRecentList.displayName = "ExpenseRecentList";

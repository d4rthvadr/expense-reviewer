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

    {
      id: "6",
      name: "Office Rent",
      type: "Expense",
      totalAmount: "3000",
      description: "Monthly office rent payment",
      currency: "USD",
      createdOn: "2025-06-25",
    },
    {
      id: "7",
      name: "Utilities",
      type: "Expense",
      totalAmount: "450",
      description: "Monthly utilities bill (electricity, water, internet)",
      currency: "USD",
      createdOn: "2025-06-24",
    },
    {
      id: "8",
      name: "Employee Training",
      type: "Expense",
      totalAmount: "600",
      description: "Workshop for employee skill development",
      currency: "USD",
      createdOn: "2025-06-23",
    },
    {
      id: "9",
      name: "Insurance",
      type: "Expense",
      totalAmount: "900",
      description: "Annual business insurance premium",
      currency: "USD",
      createdOn: "2025-06-22",
    },
    {
      id: "10",
      name: "Maintenance",
      type: "Expense",
      totalAmount: "350",
      description: "Office equipment maintenance",
      currency: "USD",
      createdOn: "2025-06-21",
    },
    {
      id: "11",
      name: "Client Entertainment",
      type: "Expense",
      totalAmount: "400",
      description: "Dinner with potential clients",
      currency: "USD",
      createdOn: "2025-06-20",
    },
    {
      id: "12",
      name: "Legal Fees",
      type: "Expense",
      totalAmount: "750",
      description: "Legal consultation for contracts",
      currency: "USD",
      createdOn: "2025-06-19",
    },
    {
      id: "13",
      name: "Website Hosting",
      type: "Expense",
      totalAmount: "120",
      description: "Annual website hosting fee",
      currency: "USD",
      createdOn: "2025-06-18",
    },
    {
      id: "14",
      name: "Advertising",
      type: "Expense",
      totalAmount: "950",
      description: "Online advertising for new product",
      currency: "USD",
      createdOn: "2025-06-17",
    },
    {
      id: "15",
      name: "Recruitment",
      type: "Expense",
      totalAmount: "300",
      description: "Job posting and recruitment agency fees",
      currency: "USD",
      createdOn: "2025-06-16",
    },
    {
      id: "16",
      name: "Office Furniture",
      type: "Expense",
      totalAmount: "1100",
      description: "Purchase of new office chairs and desks",
      currency: "USD",
      createdOn: "2025-06-15",
    },
    {
      id: "17",
      name: "Printing",
      type: "Expense",
      totalAmount: "200",
      description: "Printing marketing materials",
      currency: "USD",
      createdOn: "2025-06-14",
    },
    {
      id: "18",
      name: "Postage",
      type: "Expense",
      totalAmount: "80",
      description: "Mailing documents to clients",
      currency: "USD",
      createdOn: "2025-06-13",
    },
    {
      id: "19",
      name: "Subscriptions",
      type: "Expense",
      totalAmount: "250",
      description: "Online tools and magazine subscriptions",
      currency: "USD",
      createdOn: "2025-06-12",
    },
  ];
};

const ExpenseListPage = async () => {
  const expensesData = await getData();
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="text-2xl font-bold mb-4">Expenses</h1>
      </div>
      <DataTable columns={columns} data={expensesData} />
    </div>
  );
};

export default ExpenseListPage;

ExpenseListPage.displayName = "ExpenseListPage";

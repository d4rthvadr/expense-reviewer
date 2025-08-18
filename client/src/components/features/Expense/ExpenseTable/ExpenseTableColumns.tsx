"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Edit } from "lucide-react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/money.util";
import { Expense } from "@/constants/expense";
import { useExpenseStore } from "@/stores/expenseStore";
import { Currency } from "@/constants/currency.enum";
import { Category } from "@/constants/category.enum";

const EditButton = ({ expense }: { expense: Expense }) => {
  const openEditSheet = useExpenseStore((state) => state.openEditSheet);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => openEditSheet(expense)}
      className="text-blue-500 hover:text-blue-700"
    >
      <Edit className="h-4 w-4 mr-1" />
      <span>Edit</span>
    </Button>
  );
};

export type ExpenseColumns = {
  id?: string;
  name: string;
  amount: number;
  currency: Currency;
  category: Category;
  description?: string;
  qty: number;
  createdAt: string;
};

export const columns: ColumnDef<ExpenseColumns>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <ArrowUpDown className="ml-2 h-4 w-4" />
          <span>Type</span>
        </Button>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description;
      return description ? (
        <span className="max-w-[200px] truncate" title={description}>
          {description}
        </span>
      ) : (
        <span className="text-gray-400">-</span>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category;
      return (
        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
          {category
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (l: string) => l.toUpperCase())}
        </span>
      );
    },
  },
  {
    accessorKey: "qty",
    header: "Quantity",
    cell: ({ row }) => {
      const { qty = 1 } = row.original;
      return qty;
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const { amount = 0, currency = "USD" } = row.original;
      return formatCurrency(amount, currency);
    },
  },

  {
    accessorKey: "createdAt",
    header: "Created On",
  },
  {
    id: "edit",
    header: "Edit",
    cell: ({ row }) => <EditButton expense={row.original} />,
  },
];

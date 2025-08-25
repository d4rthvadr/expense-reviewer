"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/money.util";
import { Budget } from "@/constants/budget";
import { useBudgetStore } from "@/stores/budgetStore";
import { Currency } from "@/constants/currency.enum";
import { Category } from "@/constants/category.enum";

// Edit button component that can use hooks
const EditButton = ({ budget }: { budget: Budget }) => {
  const openEditSheet = useBudgetStore((state) => state.openEditSheet);

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => openEditSheet(budget)}
      className="text-blue-500 hover:text-blue-700"
    >
      <span>Edit</span>
    </Button>
  );
};

export type BudgetColumns = {
  id: string;
  name?: string;
  amount: number;
  category: Category;
  currency?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export const columns: ColumnDef<BudgetColumns>[] = [
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
            .replace(/\b\w/g, (l) => l.toUpperCase())}
        </span>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const { amount = 0, currency = Currency.USD } = row.original;
      return formatCurrency(amount, currency);
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created On",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return date.toLocaleDateString();
    },
  },
  {
    id: "edit",
    header: "Edit",
    cell: ({ row }) => <EditButton budget={row.original} />,
  },
];

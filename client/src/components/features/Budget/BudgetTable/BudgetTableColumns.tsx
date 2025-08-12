"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Edit } from "lucide-react";
import { ArrowUpDown } from "lucide-react";
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
      variant="ghost"
      size="sm"
      onClick={() => openEditSheet(budget)}
      className="text-blue-500 hover:text-blue-700"
    >
      <Edit className="h-4 w-4 mr-1" />
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
          <span>Name</span>
        </Button>
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

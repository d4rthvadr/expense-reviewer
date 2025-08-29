"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/money.util";
import { useTransactionStore } from "@/stores/transactionStore";
import { Currency } from "@/constants/currency.enum";
import { Category } from "@/constants/category.enum";
import { Transaction, TransactionType } from "@/constants/transaction";

const EditButton = ({ expense }: { expense: Transaction }) => {
  const openEditSheet = useTransactionStore((state) => state.openEditSheet);

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => openEditSheet(expense)} // Use the transaction as-is, preserving its original type
      className="text-blue-500 hover:text-blue-700"
    >
      <span>Edit</span>
    </Button>
  );
};

export type TransactionColumns = {
  id?: string;
  name: string;
  amount: number;
  currency: Currency;
  category: Category;
  type: TransactionType;
  qty: number;
  createdAt: string;
};

export const columns: ColumnDef<TransactionColumns>[] = [
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
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const { amount = 0, currency = "USD", type } = row.original;

      const totalAmount = amount * (row.original.qty || 1);
      const formattedAmount = formatCurrency(totalAmount, currency);

      // Color code based on transaction type with more specific styling
      const isExpense = type === "EXPENSE";
      const colorClass = isExpense
        ? "text-red-500 font-semibold"
        : "text-green-500 font-semibold";

      return (
        <span
          className={colorClass}
          style={{
            color: isExpense ? "#ef4444" : "#10b981",
          }}
        >
          {isExpense ? `-${formattedAmount}` : `+${formattedAmount}`}
        </span>
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
    cell: ({ row }) => <EditButton expense={row.original} />,
  },
];

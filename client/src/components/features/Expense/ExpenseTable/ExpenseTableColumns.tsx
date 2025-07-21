"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Edit } from "lucide-react";
import Link from "next/link";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/money.util";
import ExpenseStatusBadge from "../ExpenseStatusBadge";
import { ExpenseItem, ExpenseStatus } from "@/constants/expense";

export type ExpenseColumns = {
  id: string;
  name: string;
  createdAt: Date;
  totalAmount: number;
  items: ExpenseItem[];
  status?: ExpenseStatus | undefined;
  type?: string;
  currency: string;
};

export const columns: ColumnDef<ExpenseColumns>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "type",
    header: "Type",
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const { status } = row.original;
      return <ExpenseStatusBadge status={status} />;
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
    cell: ({ row }) => {
      const { totalAmount = 0, currency } = row.original;
      return formatCurrency(totalAmount, currency);
    },
  },
  {
    header: "Sub Items",
    cell: ({ row }) => {
      return row.original.items.length || 0;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created On",
  },
  {
    id: "edit",
    header: "Edit",
    cell: ({ row }) => (
      <Link href={`/dashboard/expenses/${row.original.id}`}>
        <span className="text-blue-500 hover:underline flex items-center space-x-1">
          <Edit className="h-4 w-4" />
          <span>Edit</span>
        </span>
      </Link>
    ),
  },
];

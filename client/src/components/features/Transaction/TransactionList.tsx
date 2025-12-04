"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Transaction } from "@/constants/transaction";
import { useTransactionStore } from "@/stores/transactionStore";
import TransactionEditForm from "./TransactionEditForm";
import TransactionFilterToolbar from "./TransactionFilterToolbar";
import TransactionDateFilter from "./TransactionDateFilter";
import { Toaster } from "@/components/ui/sonner";
import { getTransactions } from "@/actions/transaction";
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Helper function to format category names for display
const formatCategoryName = (category: string): string => {
  return category
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

// Helper function to format amount with currency
const formatAmount = (amount: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const TransactionList = () => {
  const [transactions, setTransaction] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [paginationMeta, setPaginationMeta] = useState({
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
    total: 0,
    limit: 10,
  });

  const {
    selectedTransaction,
    isEditSheetOpen,
    openEditSheet,
    closeEditSheet,
    transactionTypeFilter,
  } = useTransactionStore();

  const handleCloseEditSheet = () => {
    closeEditSheet();
    refreshTransactions(); // Refresh data after editing
  };

  const handleDateChange = (from: Date | undefined, to: Date | undefined) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const refreshTransactions = useCallback(
    async (page: number = 1, newPageSize: number = 10) => {
      setIsLoading(true);
      try {
        // Convert filter to API type
        const filterType =
          transactionTypeFilter === "ALL" ? undefined : transactionTypeFilter;

        // Format dates to YYYY-MM-DD
        const dateFromStr = dateFrom?.toISOString().split("T")[0];
        const dateToStr = dateTo?.toISOString().split("T")[0];

        const response = await getTransactions(
          page,
          newPageSize,
          filterType,
          dateFromStr,
          dateToStr
        );

        const { data, ...pagination } = response;

        setTransaction(data);
        setPaginationMeta((prev) => {
          return { ...prev, ...pagination };
        });
      } catch (error) {
        console.error("Error refreshing transactions:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [transactionTypeFilter, dateFrom, dateTo]
  );

  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]); // Now includes transactionTypeFilter via useCallback dependency

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 bg-primary-foreground rounded-md"
        >
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-16 text-muted-foreground">
      <Clock className="mx-auto h-16 w-16 mb-4 opacity-50" />
      <p className="text-base font-medium">No transactions found</p>
      <p className="text-sm mt-2">
        {transactionTypeFilter !== "ALL"
          ? `No ${transactionTypeFilter.toLowerCase()} transactions to display`
          : "Your transactions will appear here once you add them"}
      </p>
      <Button
        variant="outline"
        className="mt-4"
        onClick={() => openEditSheet(null)}
      >
        Add Your First Transaction
      </Button>
    </div>
  );

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => (
    <div
      className="flex items-center gap-3 p-4 bg-primary-foreground rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => openEditSheet(transaction)}
    >
      {/* Transaction Type Icon */}
      <div
        className={`flex items-center justify-center h-12 w-12 rounded-full flex-shrink-0 ${
          transaction.type === "INCOME"
            ? "bg-green-100 dark:bg-green-900/20"
            : "bg-red-100 dark:bg-red-900/20"
        }`}
      >
        {transaction.type === "INCOME" ? (
          <ArrowDownRight className="h-6 w-6 text-green-600 dark:text-green-400" />
        ) : (
          <ArrowUpRight className="h-6 w-6 text-red-600 dark:text-red-400" />
        )}
      </div>

      {/* Transaction Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{transaction.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <span className="truncate">
            {formatCategoryName(transaction.category)}
          </span>
          <span>•</span>
          <span className="whitespace-nowrap">
            {formatDistanceToNow(new Date(transaction.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>

      {/* Transaction Amount */}
      <div className="text-right flex-shrink-0">
        <p
          className={`text-base font-bold ${
            transaction.type === "INCOME"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {transaction.type === "INCOME" ? "+" : "-"}
          {formatAmount(transaction.amount, transaction.currency)}
        </p>
        {transaction.qty && transaction.qty > 1 && (
          <p className="text-xs text-muted-foreground mt-1">
            Qty: {transaction.qty}
          </p>
        )}
      </div>
    </div>
  );

  const Pagination = () => {
    if (paginationMeta.totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6 px-2">
        <div className="text-sm text-muted-foreground">
          Page {paginationMeta.page} of {paginationMeta.totalPages} • Total:{" "}
          {paginationMeta.total} transactions
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              refreshTransactions(paginationMeta.page - 1, paginationMeta.limit)
            }
            disabled={!paginationMeta.hasPrevious || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              refreshTransactions(paginationMeta.page + 1, paginationMeta.limit)
            }
            disabled={!paginationMeta.hasNext || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Toaster />
      <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Transactions</h1>
          <div className="flex items-center gap-2">
            <TransactionDateFilter onDateChange={handleDateChange} />
            <Button variant="outline" onClick={() => openEditSheet(null)}>
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <TransactionFilterToolbar />

        {/* Transactions List */}
        <div className="mt-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : transactions.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))}
              </div>
              <Pagination />
            </>
          )}
        </div>
      </div>

      <Sheet open={isEditSheetOpen} onOpenChange={closeEditSheet}>
        <TransactionEditForm
          expense={selectedTransaction || undefined} // Handle null case
          onClose={handleCloseEditSheet}
        />
      </Sheet>
    </>
  );
};

export default TransactionList;

TransactionList.displayName = "TransactionList";

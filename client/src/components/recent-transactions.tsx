"use client";
import React, { useState, useEffect } from "react";
import { getTransactions } from "@/actions/transaction";
import { Transaction } from "@/constants/transaction";
import ErrorBoundary from "@/components/error-boundary";
import { ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

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

const RecentTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recent transactions
  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getTransactions(1, 5); // Get first 5 transactions

      // Check if response has success property, otherwise assume success if data exists
      const isSuccessful =
        response.success !== undefined ? response.success : !!response.data;

      if (isSuccessful && response.data) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setTransactions(response.data);
        } else {
          setTransactions([]);
        }
      } else {
        setError(
          response.error ||
            response.message ||
            "Failed to load recent transactions"
        );
        setTransactions([]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load recent transactions"
      );
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchTransactions();
  }, []);

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3">
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

  const ErrorMessage = () => (
    <div className="text-center py-8 text-muted-foreground">
      <p className="text-sm">{error}</p>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-8 text-muted-foreground">
      <Clock className="mx-auto h-12 w-12 mb-2 opacity-50" />
      <p className="text-sm">No recent transactions</p>
      <p className="text-xs mt-1">
        Your transactions will appear here once you add them
      </p>
    </div>
  );

  const TransactionsList = () => (
    <div className="space-y-1">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
        >
          {/* Transaction Type Icon */}
          <div
            className={`flex items-center justify-center h-10 w-10 rounded-full ${
              transaction.type === "INCOME"
                ? "bg-green-100 dark:bg-green-900/20"
                : "bg-red-100 dark:bg-red-900/20"
            }`}
          >
            {transaction.type === "INCOME" ? (
              <ArrowDownRight className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
          </div>

          {/* Transaction Details */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{transaction.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
          <div className="text-right">
            <p
              className={`text-sm font-semibold ${
                transaction.type === "INCOME"
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {transaction.type === "INCOME" ? "+" : "-"}
              {formatAmount(transaction.amount, transaction.currency)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const Content = () => {
    console.log(
      "Content render - loading:",
      loading,
      "error:",
      error,
      "transactions count:",
      transactions.length
    );
    if (loading) return <LoadingSkeleton />;
    if (error) return <ErrorMessage />;
    if (transactions.length === 0) return <EmptyState />;
    return <TransactionsList />;
  };

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium">Recent Transactions</h1>
          <a
            href="/dashboard/transactions"
            className="text-xs text-primary hover:underline"
          >
            View all
          </a>
        </div>
        <Content />
      </div>
    </ErrorBoundary>
  );
};

RecentTransactions.displayName = "RecentTransactions";
export default RecentTransactions;

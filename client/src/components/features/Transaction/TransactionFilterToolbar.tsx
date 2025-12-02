"use client";

import { Button } from "@/components/ui/button";
import { useTransactionStore } from "@/stores/transactionStore";

const TransactionFilterToolbar = () => {
  const { transactionTypeFilter, setTransactionTypeFilter, clearFilters } =
    useTransactionStore();

  const filterOptions = [
    { value: "ALL" as const, label: "All", icon: "📊" },
    { value: "EXPENSE" as const, label: "Expenses", icon: "💸" },
    { value: "INCOME" as const, label: "Income", icon: "💰" },
  ];

  const getButtonVariant = (filterValue: "ALL" | "EXPENSE" | "INCOME") => {
    return transactionTypeFilter === filterValue ? "default" : "outline";
  };

  const getButtonStyles = (filterValue: "ALL" | "EXPENSE" | "INCOME") => {
    if (transactionTypeFilter !== filterValue) return "";

    switch (filterValue) {
      case "EXPENSE":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40";
      case "INCOME":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/50 rounded-lg mb-4">
      <span className="text-sm font-medium text-foreground mr-2">
        Filter by:
      </span>

      <div className="flex flex-wrap items-center gap-2">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={getButtonVariant(option.value)}
            size="sm"
            onClick={() => setTransactionTypeFilter(option.value)}
            className={`flex items-center gap-1 ${getButtonStyles(
              option.value
            )}`}
          >
            <span className="text-sm">{option.icon}</span>
            <span>{option.label}</span>
          </Button>
        ))}
      </div>

      {transactionTypeFilter !== "ALL" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground hover:text-foreground ml-2"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default TransactionFilterToolbar;

"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BudgetEditForm from "./BudgetEditForm";
import { Sheet } from "@/components/ui/sheet";
import { useBudgetStore } from "@/stores/budgetStore";
import { Budget } from "@/constants/budget";
import { useEffect, useState } from "react";
import { getBudgets } from "@/actions/budget";
import { Wallet, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Toaster } from "@/components/ui/sonner";

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

const BudgetList = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [paginationMeta, setPaginationMeta] = useState({
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
    total: 0,
    limit: 10,
  });

  const { selectedBudget, isEditSheetOpen, openEditSheet, closeEditSheet } =
    useBudgetStore();

  const handleCloseEditSheet = () => {
    closeEditSheet();
    refreshBudgets(); // Refresh data after editing
  };

  const refreshBudgets = async (page: number = 1, newPageSize: number = 10) => {
    try {
      const { data, ...pagination } = await getBudgets(page, newPageSize);
      setBudgets(data);
      setPaginationMeta((prev) => {
        return { ...prev, ...pagination };
      });
    } catch (error) {
      console.error("Error refreshing budgets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshBudgets();
  }, []);

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
      <Wallet className="mx-auto h-16 w-16 mb-4 opacity-50" />
      <p className="text-base font-medium">No budgets found</p>
      <p className="text-sm mt-2">
        Your budgets will appear here once you add them
      </p>
      <Button
        variant="outline"
        className="mt-4"
        onClick={() => openEditSheet({} as Budget)}
      >
        Add Your First Budget
      </Button>
    </div>
  );

  const BudgetCard = ({ budget }: { budget: Budget }) => (
    <div
      className="flex items-center gap-3 p-4 bg-primary-foreground rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => openEditSheet(budget)}
    >
      {/* Budget Icon */}
      <div className="flex items-center justify-center h-12 w-12 rounded-full flex-shrink-0 bg-blue-100 dark:bg-blue-900/20">
        <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>

      {/* Budget Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">
          {budget.name || formatCategoryName(budget.category)}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <span className="truncate">
            {formatCategoryName(budget.category)}
          </span>
          <span>•</span>
          <span className="whitespace-nowrap">
            {formatDistanceToNow(new Date(budget.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>

      {/* Budget Amount */}
      <div className="text-right flex-shrink-0">
        <p className="text-base font-bold text-blue-600 dark:text-blue-400">
          {formatAmount(budget.amount, budget.currency)}
        </p>
      </div>
    </div>
  );

  const Pagination = () => {
    if (paginationMeta.totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6 px-2">
        <div className="text-sm text-muted-foreground">
          Page {paginationMeta.page} of {paginationMeta.totalPages} • Total:{" "}
          {paginationMeta.total} budgets
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              refreshBudgets(paginationMeta.page - 1, paginationMeta.limit)
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
              refreshBudgets(paginationMeta.page + 1, paginationMeta.limit)
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
          <h1 className="text-2xl sm:text-3xl font-bold">Budgets</h1>
          <Button variant="outline" onClick={() => openEditSheet({} as Budget)}>
            Add Budget
          </Button>
        </div>

        {/* Budgets List */}
        <div className="mt-6">
          {isLoading ? (
            <LoadingSkeleton />
          ) : budgets.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="space-y-2">
                {budgets.map((budget) => (
                  <BudgetCard key={budget.id} budget={budget} />
                ))}
              </div>
              <Pagination />
            </>
          )}
        </div>
      </div>

      {/* Edit Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={closeEditSheet}>
        {selectedBudget && (
          <BudgetEditForm
            budget={selectedBudget}
            onClose={handleCloseEditSheet}
          />
        )}
      </Sheet>
    </>
  );
};

export default BudgetList;

BudgetList.displayName = "BudgetList";

"use client";
import { Button } from "@/components/ui/button";
import BudgetEditForm from "./BudgetEditForm";
import DataTable from "@/components/features/Datatable/DataTable";
import { Sheet } from "@/components/ui/sheet";
import { columns } from "@/components/features/Budget/BudgetTable/BudgetTableColumns";
import { useBudgetStore } from "@/stores/budgetStore";
import { Budget } from "@/constants/budget";
import { useEffect, useState } from "react";
import { getBudgets } from "@/actions/budget";

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

  return (
    <>
      <div className="w-full py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 py-2 flex justify-between rounded-md">
          <h1 className="text-2xl font-bold mb-4">Budgets</h1>
          <Button variant="outline" onClick={() => openEditSheet({} as Budget)}>
            Add Budget
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={budgets}
          pagination={{
            page: paginationMeta.page,
            totalPages: paginationMeta.totalPages,
            limit: paginationMeta.limit,
            hasNext: paginationMeta.hasNext,
            hasPrevious: paginationMeta.hasPrevious,
            total: paginationMeta.total,
            onPageChange: refreshBudgets,
            isLoading,
          }}
        />
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

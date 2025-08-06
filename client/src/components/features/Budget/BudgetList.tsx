"use client";
import { Button } from "@/components/ui/button";
import BudgetEditForm from "./BudgetEditForm";
import DataTable from "@/components/features/Datatable/DataTable";
import { Sheet } from "@/components/ui/sheet";
import { columns } from "@/components/features/Budget/BudgetTable/BudgetTableColumns";
import { useBudgetStore } from "@/stores/budgetStore";
import { Budget } from "@/constants/budget";
import { useState } from "react";
import { getBudgets } from "@/actions/budget";

const BudgetList = ({ budgets: initialBudgets }: { budgets: Budget[] }) => {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);

  const { selectedBudget, isEditSheetOpen, openEditSheet, closeEditSheet } =
    useBudgetStore();

  const handleCloseEditSheet = () => {
    closeEditSheet();

    refreshBudgets(); // Refresh data after editing
  };

  const refreshBudgets = async () => {
    try {
      const response = await getBudgets();
      setBudgets(response.data);
    } catch (error) {
      console.error("Error refreshing budgets:", error);
    }
  };

  return (
    <>
      <div className="container mx-auto py-10">
        <div className="mb-8 py-2 flex justify-between rounded-md">
          <h1 className="text-2xl font-bold mb-4">Budgets</h1>
          <Button variant="outline" onClick={() => openEditSheet({} as Budget)}>
            Add Budget
          </Button>
        </div>
        <DataTable columns={columns} data={budgets} />
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

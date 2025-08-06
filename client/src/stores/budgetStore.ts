import { create } from "zustand";
import { Budget } from "@/constants/budget";

interface BudgetStore {
  selectedBudget: Budget | null;
  isEditSheetOpen: boolean;
  openEditSheet: (budget: Budget | null) => void;
  closeEditSheet: () => void;
}

export const useBudgetStore = create<BudgetStore>((set) => ({
  selectedBudget: null,
  isEditSheetOpen: false,
  openEditSheet: (budget: Budget | null) =>
    set({ selectedBudget: budget, isEditSheetOpen: true }),
  closeEditSheet: () => set({ selectedBudget: null, isEditSheetOpen: false }),
}));

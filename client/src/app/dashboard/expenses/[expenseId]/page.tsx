import React from "react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import ExpenseDetails from "@/components/features/Expense/ExpenseDetails";
import ExpenseItemList from "@/components/features/Expense/ExpenseItemList";
import ExpenseEditForm from "@/components/features/Expense/ExpenseEditForm";

const ExpenseItemPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Expense Item</h1>
      {/* CONTAINER */}
      <div className="mt-4 flex flex-col xl:flex-row gap-8">
        {/* LEFT */}
        <div className="w-full xl:w-1/3 space-y-6">
          {/* INFORMATION */}
          <div className="bg-primary-foreground p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">Details</h1>
              <Sheet>
                <SheetTrigger asChild>
                  <Button>Edit </Button>
                </SheetTrigger>
                <ExpenseEditForm />
              </Sheet>
            </div>

            <ExpenseDetails />
          </div>
        </div>

        <div className="w-full xl:w-1/3 space-y-6">
          {/* INFORMATION CONTAINER */}
          <div className="bg-primary-foreground p-4 rounded-lg">
            <ExpenseItemList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseItemPage;

ExpenseItemPage.displayName = "ExpenseItemPage";

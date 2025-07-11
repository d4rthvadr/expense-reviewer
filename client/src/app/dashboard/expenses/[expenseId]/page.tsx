"use client";
import React, { useRef } from "react";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import ExpenseDetails from "@/components/features/Expense/ExpenseDetails";
import ExpenseItemList from "@/components/features/Expense/ExpenseItemList";
import ExpenseEditForm from "@/components/features/Expense/ExpenseEditForm";
import { useGetExpense } from "@/app/hooks/useGetExpense";
import { Toaster } from "@/components/ui/sonner";

interface ExpenseItemPageProps {
  params: Promise<{
    expenseId: string;
  }>;
}

const ExpenseItemPage = ({ params }: ExpenseItemPageProps) => {
  const { expenseId } = React.use(params);
  const isExpenseNew = expenseId === "create";
  const { loading, expense } = useGetExpense(expenseId, isExpenseNew);
  const isNotExpenseValid = !expense && !isExpenseNew;
  const sheetTriggerRef = useRef<HTMLButtonElement>(null);

  const handleEditExpense = () => {
    sheetTriggerRef.current?.click();
  };

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    );
  }

  if (isNotExpenseValid) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Expense Item Not Found</h1>
        <p className="text-red-500">
          The requested expense item does not exist.
        </p>
      </div>
    );
  }
  return (
    <>
      <Toaster />
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
                    <Button
                      ref={sheetTriggerRef}
                      className={expense ? "" : "hidden"}
                      variant="outline"
                    >
                      {isExpenseNew && !expense ? "Create" : "Edit"}
                    </Button>
                  </SheetTrigger>
                  <ExpenseEditForm onClose={() => handleEditExpense()} />
                </Sheet>
              </div>

              <ExpenseDetails onEditExpense={handleEditExpense} />
            </div>
          </div>

          {expense && (
            <div className="w-full xl:w-1/3 space-y-6">
              {/* INFORMATION CONTAINER */}
              <div className="bg-primary-foreground p-4 rounded-lg">
                <ExpenseItemList />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ExpenseItemPage;

ExpenseItemPage.displayName = "ExpenseItemPage";

"use client";
import React, { useEffect, useState } from "react";
import DataTable from "@/components/features/Datatable/DataTable";
import { columns } from "@/components/features/Transaction/TransactionTable/TransactionTableColumns";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Transaction } from "@/constants/transaction";
import { useTransactionStore } from "@/stores/transactionStore";
import TransactionEditForm from "./TransactionEditForm";
import { Toaster } from "@/components/ui/sonner";
import { getTransactions } from "@/actions/transaction";

const TransactionList = () => {
  const [transactions, setTransaction] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  } = useTransactionStore();

  const handleCloseEditSheet = () => {
    closeEditSheet();
    refreshTransactions(); // Refresh data after editing
  };

  const refreshTransactions = async (
    page: number = 1,
    newPageSize: number = 10
  ) => {
    try {
      const response = await getTransactions(page, newPageSize);

      const { data, ...pagination } = response;

      console.log("[PEEK] Fetched transactions:", { data, pagination });

      setTransaction(data);
      setPaginationMeta((prev) => {
        return { ...prev, ...pagination };
      });
    } catch (error) {
      console.error("Error refreshing transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshTransactions();
  }, []);

  return (
    <>
      <Toaster />
      <div className="w-full py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 py-2 flex  justify-between  rounded-md">
          <h1 className="text-2xl font-bold mb-4">Transactions</h1>
          <Button
            variant="outline"
            onClick={() => openEditSheet({ type: "EXPENSE" } as Transaction)}
          >
            Add Transaction
          </Button>
        </div>
        <DataTable
          columns={
            columns as import("@tanstack/react-table").ColumnDef<
              Transaction,
              unknown
            >[]
          }
          data={transactions}
          pagination={{
            page: paginationMeta.page,
            totalPages: paginationMeta.totalPages,
            limit: paginationMeta.limit,
            hasNext: paginationMeta.hasNext,
            hasPrevious: paginationMeta.hasPrevious,
            total: paginationMeta.total,
            onPageChange: refreshTransactions,
            isLoading,
          }}
        />
      </div>

      <Sheet open={isEditSheetOpen} onOpenChange={closeEditSheet}>
        {selectedTransaction && (
          <TransactionEditForm
            expense={selectedTransaction}
            onClose={handleCloseEditSheet}
          />
        )}
      </Sheet>
    </>
  );
};

export default TransactionList;

TransactionList.displayName = "TransactionList";

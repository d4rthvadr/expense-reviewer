"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionType } from "@/constants/transaction";

interface TransactionTypeTabsProps {
  selectedType: TransactionType;
  onTypeChange: (type: TransactionType) => void;
  disabled?: boolean;
}

const TransactionTypeTabs: React.FC<TransactionTypeTabsProps> = ({
  selectedType,
  onTypeChange,
  disabled = false,
}) => {
  return (
    <div className="w-full mb-6">
      <Tabs
        value={selectedType}
        onValueChange={(value: string) =>
          onTypeChange(value as TransactionType)
        }
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="EXPENSE"
            disabled={disabled}
            className="flex items-center gap-2 data-[state=active]:bg-red-100 data-[state=active]:text-red-700 data-[state=active]:border-red-200"
          >
            <span className="text-lg">💸</span>
            <span>Expense</span>
          </TabsTrigger>
          <TabsTrigger
            value="INCOME"
            disabled={disabled}
            className="flex items-center gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-700 data-[state=active]:border-green-200"
          >
            <span className="text-lg">💰</span>
            <span>Income</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TransactionTypeTabs;

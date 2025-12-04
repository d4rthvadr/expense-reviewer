import React from "react";
import TransactionReviewList from "@/components/features/TransactionReview/TransactionReviewList";

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Transaction Reviews</h1>
        <p className="text-muted-foreground">
          AI-generated insights and analysis from your transaction history
        </p>
      </div>

      <TransactionReviewList />
    </div>
  );
}

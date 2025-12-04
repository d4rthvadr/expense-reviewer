"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TransactionReview } from "@/types/transaction-review";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface TransactionReviewModalProps {
  review: TransactionReview | null;
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
}

export default function TransactionReviewModal({
  review,
  open,
  onOpenChangeAction,
}: TransactionReviewModalProps) {
  if (!review) return null;

  const transactionCount = review.transactions?.length || 0;
  const reviewDate = format(new Date(review.createdAt), "MMMM dd, yyyy");

  return (
    <Sheet open={open} onOpenChange={onOpenChangeAction}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="p-6">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl">Transaction Review</SheetTitle>
            <SheetDescription className="text-base mt-2">
              Generated on {reviewDate} • {transactionCount} transaction
              {transactionCount !== 1 ? "s" : ""} analyzed
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            {/* Review Text */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-foreground uppercase tracking-wide">
                Review Summary
              </h3>
              <div className="bg-muted/50 rounded-lg p-5 border border-border">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {review.reviewText}
                </p>
              </div>
            </div>

            {/* Transactions List */}
            {review.transactions && review.transactions.length > 0 && (
              <>
                <Separator className="my-6" />
                <div>
                  <h3 className="text-sm font-semibold mb-4 text-foreground uppercase tracking-wide">
                    Analyzed Transactions ({transactionCount})
                  </h3>
                  <div className="space-y-3">
                    {review.transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors border border-border"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {transaction.type === "EXPENSE" ? (
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex-shrink-0">
                              <ArrowUpCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex-shrink-0">
                              <ArrowDownCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {transaction.category}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Quantity: {transaction.qty}
                            </p>
                          </div>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <p
                            className={`text-base font-semibold ${
                              transaction.type === "EXPENSE"
                                ? "text-red-600 dark:text-red-400"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          >
                            {transaction.type === "EXPENSE" ? "-" : "+"}
                            {transaction.currency}{" "}
                            {transaction.amount.toFixed(2)}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1.5">
                            {transaction.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

TransactionReviewModal.displayName = "TransactionReviewModal";

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getTransactionReviews } from "@/actions/transaction-review";
import { TransactionReview } from "@/types/transaction-review";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import TransactionReviewModal from "./TransactionReviewModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  subDays,
  subMonths,
  startOfYear,
} from "date-fns";

export default function TransactionReviewList() {
  const [reviews, setReviews] = useState<TransactionReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReview, setSelectedReview] =
    useState<TransactionReview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    startOfMonth(new Date())
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    endOfMonth(new Date())
  );

  const limit = 10;

  const refreshReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getTransactionReviews(
        currentPage,
        limit,
        dateFrom,
        dateTo,
        true
      );

      console.log("Transaction Reviews Response:", response);
      console.log("Response data:", response.data);
      console.log("Response data length:", response.data?.length);
      console.log("Response success:", response.success);
      console.log("Response totalPages:", response.totalPages);

      // Handle response - check for data array presence
      if (response.data && Array.isArray(response.data)) {
        setReviews(response.data);
        setTotalPages(response.totalPages || 1);
        console.log("Set reviews:", response.data.length, "items");
      } else {
        console.log("No data in response, setting empty");
        setReviews([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch transaction reviews:", error);
      setReviews([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, dateFrom, dateTo]);

  useEffect(() => {
    refreshReviews();
  }, [refreshReviews]);

  const handleReviewClick = (review: TransactionReview) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleDateChange = useCallback(
    (from: Date | undefined, to: Date | undefined) => {
      setDateFrom(from);
      setDateTo(to);
      setCurrentPage(1); // Reset to first page when filters change
    },
    []
  );

  const applyPreset = (preset: string) => {
    const now = new Date();
    let from: Date;
    let to: Date = now;

    switch (preset) {
      case "last7":
        from = subDays(now, 7);
        break;
      case "last30":
        from = subDays(now, 30);
        break;
      case "last90":
        from = subDays(now, 90);
        break;
      case "thisMonth":
        from = startOfMonth(now);
        to = endOfMonth(now);
        break;
      case "lastMonth":
        const lastMonth = subMonths(now, 1);
        from = startOfMonth(lastMonth);
        to = endOfMonth(lastMonth);
        break;
      case "thisYear":
        from = startOfYear(now);
        break;
      default:
        from = subDays(now, 30);
    }

    handleDateChange(from, to);
  };

  const clearFilters = () => {
    const now = new Date();
    handleDateChange(startOfMonth(now), endOfMonth(now));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Date Filter */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {dateFrom && dateTo
                    ? `${format(dateFrom, "MMM dd")} - ${format(
                        dateTo,
                        "MMM dd, yyyy"
                      )}`
                    : "Select date range"}
                </span>
                <span className="sm:hidden">Date Range</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Quick Presets</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset("last7")}
                    >
                      Last 7 days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset("last30")}
                    >
                      Last 30 days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset("last90")}
                    >
                      Last 90 days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset("thisMonth")}
                    >
                      This month
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset("lastMonth")}
                    >
                      Last month
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset("thisYear")}
                    >
                      This year
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Custom Range</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">From</p>
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={(date) => handleDateChange(date, dateTo)}
                        initialFocus
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">To</p>
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={(date) => handleDateChange(dateFrom, date)}
                        initialFocus
                      />
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            No transaction reviews found for this period.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {reviews.map((review) => {
              const transactionCount = review.transactions?.length || 0;
              const excerpt =
                review.reviewText.length > 150
                  ? review.reviewText.substring(0, 150) + "..."
                  : review.reviewText;
              const timeAgo = formatDistanceToNow(new Date(review.createdAt), {
                addSuffix: true,
              });

              return (
                <div
                  key={review.id}
                  className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleReviewClick(review)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          {format(new Date(review.createdAt), "MMM dd, yyyy")} •{" "}
                          {transactionCount} transaction
                          {transactionCount !== 1 ? "s" : ""}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {timeAgo}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                        {excerpt}
                      </p>
                      <div className="mt-2 flex justify-end">
                        <span className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <TransactionReviewModal
        review={selectedReview}
        open={isModalOpen}
        onOpenChangeAction={setIsModalOpen}
      />
    </div>
  );
}

TransactionReviewList.displayName = "TransactionReviewList";

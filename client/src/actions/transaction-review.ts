"use server";

import {
  clientErrorHandler,
  getAuthenticatedClient,
  TListResponse,
  TResponse,
  defaultListResponse,
} from "@/data/client";
import { format } from "date-fns";
import { TransactionReview } from "@/types/transaction-review";

/**
 * Fetches transaction reviews for the authenticated user
 */
export async function getTransactionReviews(
  page: number = 1,
  limit: number = 10,
  dateFrom?: Date,
  dateTo?: Date,
  includeTransactions: boolean = true
): Promise<TListResponse<TransactionReview>> {
  try {
    const offset = (page - 1) * limit;
    const searchParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    // Add date filters if provided
    if (dateFrom) {
      searchParams.set("filters[dateFrom]", format(dateFrom, "yyyy-MM-dd"));
    }
    if (dateTo) {
      searchParams.set("filters[dateTo]", format(dateTo, "yyyy-MM-dd"));
    }

    searchParams.set(
      "filters[includeTransactions]",
      includeTransactions.toString()
    );

    const client = await getAuthenticatedClient();
    const url = `/transaction-reviews?${searchParams.toString()}`;
    console.log(`Fetching transaction reviews: ${url}`); // Debug log
    const response = await client.get<TListResponse<TransactionReview>>(url);
    console.log(`Raw response:`, response); // Debug log

    // Ensure the response has success flag
    return {
      ...response,
      success: true,
    };
  } catch (error) {
    console.error("Error fetching transaction reviews:", error);
    return {
      ...defaultListResponse,
      ...clientErrorHandler(error),
    };
  }
}

/**
 * Fetches a single transaction review by ID
 */
export async function getTransactionReviewById(
  reviewId: string
): Promise<TResponse<TransactionReview>> {
  try {
    const client = await getAuthenticatedClient();
    const response = await client.get<TResponse<TransactionReview>["data"]>(
      `/transaction-reviews/${reviewId}`
    );

    return { success: true, data: response };
  } catch (error) {
    console.error("Error fetching transaction review:", error);
    return {
      ...clientErrorHandler(error),
      data: null,
    };
  }
}

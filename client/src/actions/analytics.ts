"use server";

import {
  clientErrorHandler,
  defaultListResponse,
  getAuthenticatedClient,
  TListResponse,
} from "@/data/client";

export interface AnalyticsFilters {
  dateFrom: string; // ISO date string
  dateTo: string; // ISO date string
  groupBy: "day" | "week" | "month";
}

/**
 * Interface representing transaction analytics data structure returned from the server.
 */
export interface TransactionAnalyticsData {
  period: string;
  totalAmount: number;
  transactionCount: number;
  avgTransactionAmount: number;
  isCurrentPeriod: boolean;
  type?: "EXPENSE" | "INCOME"; // Optional type filter
}

export interface BudgetData {
  category: string;
  budgetAmount: number;
  currency: string;
  createdAt: string;
}

/**
 * Interface representing budget vs transaction comparison data.
 */
export interface BudgetVsTransactionData {
  category: string;
  status: "UNDER_BUDGET" | "ON_BUDGET" | "OVER_BUDGET" | "NO_BUDGET";
  budgetAmount: number;
  transactionAmount: number;
  difference: number;
  utilizationPercentage: number;
  currency: string; // TODO: Use actual currency type
}

/**
 * Fetches transaction analytics over time from the server.
 *
 * @param filters - The analytics filters including date range, groupBy, and optional transaction type
 * @returns {Promise<TListResponse<TransactionAnalyticsData>>} A promise that resolves to analytics data and any error information.
 */
export async function getTransactionsOverTime(
  filters: AnalyticsFilters & { transactionType?: "EXPENSE" | "INCOME" }
): Promise<TListResponse<TransactionAnalyticsData>> {
  try {
    const searchParams = new URLSearchParams({
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      groupBy: filters.groupBy,
    });

    if (filters.transactionType) {
      searchParams.set("transactionType", filters.transactionType);
    }

    console.log(
      "Fetching transaction analytics with filters:",
      searchParams.toString()
    );
    const client = await getAuthenticatedClient();

    const response = await client.get<TListResponse<TransactionAnalyticsData>>(
      `/analytics/transactions-over-time?${searchParams.toString()}`
    );

    return response;
  } catch (error) {
    console.error("Error fetching transaction analytics:", error);
    return {
      ...defaultListResponse,
      ...clientErrorHandler(error),
      message: "Failed to fetch transaction analytics data",
    };
  }
}

/**
 * Fetches budget data from the server.
 *
 * @returns {Promise<TListResponse<BudgetData>>} A promise that resolves to budget data and any error information.
 */
export async function getBudgetData(): Promise<TListResponse<BudgetData>> {
  try {
    const searchParams = new URLSearchParams();

    console.log("Fetching budget data with filters:", searchParams.toString());
    const client = await getAuthenticatedClient();

    const response = await client.get<TListResponse<BudgetData>>(
      `/analytics/budgets${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`
    );

    return response;
  } catch (error) {
    console.error("Error fetching budget data:", error);
    return {
      ...defaultListResponse,
      ...clientErrorHandler(error),
      message: "Failed to fetch budget data",
    };
  }
}

/**
 * Fetches budget vs transaction comparison data from the server.
 *
 * @param dateFrom - Start date in YYYY-MM-DD format
 * @param dateTo - End date in YYYY-MM-DD format
 * @param transactionType - Optional filter for transaction type (defaults to EXPENSE for backward compatibility)
 * @returns {Promise<TListResponse<BudgetVsTransactionData>>} A promise that resolves to budget vs transaction data and any error information.
 */
export async function getBudgetVsTransactionData(
  dateFrom: string,
  dateTo: string,
  transactionType: "EXPENSE" | "INCOME" = "EXPENSE"
): Promise<TListResponse<BudgetVsTransactionData>> {
  try {
    const searchParams = new URLSearchParams({
      dateFrom,
      dateTo,
      transactionType,
    });

    console.log(
      "Fetching budget vs transaction data with filters:",
      searchParams.toString()
    );

    const client = await getAuthenticatedClient();
    const response = await client.get<TListResponse<BudgetVsTransactionData>>(
      `/analytics/budget-vs-transactions?${searchParams.toString()}`
    );

    return response;
  } catch (error) {
    console.error("Error fetching budget vs transaction data:", error);
    return {
      ...defaultListResponse,
      ...clientErrorHandler(error),
      message: "Failed to fetch budget vs transaction data",
    };
  }
}

// Backward compatibility exports with deprecation warnings
/**
 * @deprecated Use getTransactionsOverTime instead. This function will be removed in a future version.
 */
export async function getExpensesOverTime(
  filters: AnalyticsFilters
): Promise<TListResponse<TransactionAnalyticsData>> {
  console.warn(
    "getExpensesOverTime is deprecated. Use getTransactionsOverTime instead."
  );
  return getTransactionsOverTime({ ...filters, transactionType: "EXPENSE" });
}

/**
 * @deprecated Use getBudgetVsTransactionData instead. This function will be removed in a future version.
 */
export async function getBudgetVsExpenseData(
  dateFrom: string,
  dateTo: string
): Promise<TListResponse<BudgetVsTransactionData>> {
  console.warn(
    "getBudgetVsExpenseData is deprecated. Use getBudgetVsTransactionData instead."
  );
  return getBudgetVsTransactionData(dateFrom, dateTo, "EXPENSE");
}

// Type aliases for backward compatibility
/**
 * @deprecated Use TransactionAnalyticsData instead
 */
export type ExpenseAnalyticsData = TransactionAnalyticsData;

/**
 * @deprecated Use BudgetVsTransactionData instead
 */
export type BudgetVsExpenseData = BudgetVsTransactionData;

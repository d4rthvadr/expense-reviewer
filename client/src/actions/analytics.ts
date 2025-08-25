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

export interface ExpenseAnalyticsData {
  period: string;
  totalAmount: number;
  expenseCount: number;
}

export interface BudgetData {
  category: string;
  budgetAmount: number;
  currency: string;
  createdAt: string;
}

export interface BudgetVsExpenseData {
  category: string;
  budgetAmount: number;
  expenseAmount: number;
  currency: string;
  utilizationPercentage: number;
  remaining: number;
  status: "UNDER_BUDGET" | "OVER_BUDGET" | "ON_BUDGET" | "NO_BUDGET";
}

/**
 * Fetches expense analytics over time from the server.
 *
 * @param filters - The analytics filters including date range and groupBy
 * @returns {Promise<TListResponse<ExpenseAnalyticsData>>} A promise that resolves to analytics data and any error information.
 */
export async function getExpensesOverTime(
  filters: AnalyticsFilters
): Promise<TListResponse<ExpenseAnalyticsData>> {
  try {
    const searchParams = new URLSearchParams({
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      groupBy: filters.groupBy,
    });

    console.log("Fetching analytics with filters:", searchParams.toString());
    const client = await getAuthenticatedClient();

    const response = await client.get<TListResponse<ExpenseAnalyticsData>>(
      `/analytics/expenses-over-time?${searchParams.toString()}`
    );

    return response;
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return {
      ...defaultListResponse,
      ...clientErrorHandler(error),
      message: "Failed to fetch analytics data",
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
 * Fetches budget vs expense comparison data from the server.
 *
 * @param dateFrom - Start date in YYYY-MM-DD format
 * @param dateTo - End date in YYYY-MM-DD format
 * @returns {Promise<BudgetVsExpenseResponse>} A promise that resolves to budget vs expense data and any error information.
 */
export async function getBudgetVsExpenseData(
  dateFrom: string,
  dateTo: string
): Promise<TListResponse<BudgetVsExpenseData>> {
  try {
    const searchParams = new URLSearchParams({
      dateFrom,
      dateTo,
    });

    console.log(
      "Fetching budget vs expense data with filters:",
      searchParams.toString()
    );

    const client = await getAuthenticatedClient();
    const response = await client.get<TListResponse<BudgetVsExpenseData>>(
      `/analytics/budget-vs-expenses?${searchParams.toString()}`
    );

    return response;
  } catch (error) {
    console.error("Error fetching budget vs expense data:", error);
    return {
      ...defaultListResponse,
      ...clientErrorHandler(error),
      message: "Failed to fetch budget vs expense data",
    };
  }
}

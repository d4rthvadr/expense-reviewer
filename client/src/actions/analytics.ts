"use server";

import { client } from "@/data/client";

export interface AnalyticsFilters {
  dateFrom: string; // ISO date string
  dateTo: string; // ISO date string
  groupBy: "day" | "week" | "month";
  userId?: string;
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

type AnalyticsResponse = {
  success: boolean;
  data: ExpenseAnalyticsData[];
  message: string;
} & { error?: string };

type BudgetResponse = {
  success: boolean;
  data: BudgetData[];
  message: string;
} & { error?: string };

type BudgetVsExpenseResponse = {
  success: boolean;
  data: BudgetVsExpenseData[];
  message: string;
} & { error?: string };

/**
 * Fetches expense analytics over time from the server.
 *
 * @param filters - The analytics filters including date range and groupBy
 * @returns {Promise<AnalyticsResponse>} A promise that resolves to analytics data and any error information.
 */
export async function getExpensesOverTime(
  filters: AnalyticsFilters
): Promise<AnalyticsResponse> {
  try {
    const searchParams = new URLSearchParams({
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      groupBy: filters.groupBy,
    });

    if (filters.userId) {
      searchParams.append("userId", filters.userId);
    }

    console.log("Fetching analytics with filters:", searchParams.toString());

    const response = await client.get<AnalyticsResponse>(
      `/analytics/expenses-over-time?${searchParams.toString()}`
    );

    return response;
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return {
      success: false,
      data: [],
      message: "Failed to fetch analytics data",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Fetches budget data from the server.
 *
 * @param userId - Optional user ID filter
 * @returns {Promise<BudgetResponse>} A promise that resolves to budget data and any error information.
 */
export async function getBudgetData(userId?: string): Promise<BudgetResponse> {
  try {
    const searchParams = new URLSearchParams();

    if (userId) {
      searchParams.append("userId", userId);
    }

    console.log("Fetching budget data with filters:", searchParams.toString());

    const response = await client.get<BudgetResponse>(
      `/analytics/budgets${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`
    );

    return response;
  } catch (error) {
    console.error("Error fetching budget data:", error);
    return {
      success: false,
      data: [],
      message: "Failed to fetch budget data",
      error: error instanceof Error ? error.message : "Unknown error occurred",
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
): Promise<BudgetVsExpenseResponse> {
  try {
    const searchParams = new URLSearchParams({
      dateFrom,
      dateTo,
    });

    console.log(
      "Fetching budget vs expense data with filters:",
      searchParams.toString()
    );

    const response = await client.get<BudgetVsExpenseResponse>(
      `/analytics/budget-vs-expenses?${searchParams.toString()}`
    );

    return response;
  } catch (error) {
    console.error("Error fetching budget vs expense data:", error);
    return {
      success: false,
      data: [],
      message: "Failed to fetch budget vs expense data",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

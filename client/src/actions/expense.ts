"use server";

import { Expense } from "@/constants/expense";
import { client } from "@/data/client";

type ResponseWithError = {
  error?: string;
};

type TExpenseListResponse = {
  data: Expense[];
  total?: number;
  limit?: number;
  offset?: number;
} & ResponseWithError;

type TExpenseResponse = {
  data: Expense | null;
  success: boolean;
} & ResponseWithError;

/**
 * Fetches the list of expenses from the server.
 *
 * @returns {Promise<TExpenseListResponse>} A promise that resolves to the list of expenses and any error information.
 *
 **/
export async function getExpenses(): Promise<TExpenseListResponse> {
  try {
    const response = await client.get<TExpenseListResponse>("/expenses");

    return response;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return {
      data: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Fetches an expense by its unique identifier.
 *
 * @param id - The unique identifier of the expense to retrieve.
 * @returns A promise that resolves to a `TExpenseResponse` object containing the expense data or an error message.
 */
export async function getExpensesById(id: string): Promise<TExpenseResponse> {
  try {
    const response = await client.get<TExpenseResponse["data"]>(
      `/expenses/${id}`
    );
    return { success: true, data: response };
  } catch (error) {
    console.error("Error fetching expense by ID:", error);
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Creates a new expense by sending a POST request to the server.
 *
 * @param expense - The expense object to be created.
 * @returns A promise that resolves to a TExpenseResponse object containing the result of the operation.
 *
 */
export async function createExpense(
  expense: Expense
): Promise<TExpenseResponse> {
  try {
    const response = await client.post<TExpenseResponse["data"]>(
      "/expenses",
      expense
    );
    return { success: true, data: response };
  } catch (error) {
    console.error("Error creating expense:", error);
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateExpense(
  expense: Expense,
  expenseId: string
): Promise<TExpenseResponse> {
  try {
    const response = await client.put<TExpenseResponse["data"]>(
      `/expenses/${expenseId}`,
      expense
    );
    return { success: true, data: response };
  } catch (error) {
    console.error("Error updating expense:", error);
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function deleteExpense(
  expenseId: string
): Promise<TExpenseResponse> {
  try {
    const response = await client.delete<TExpenseResponse["data"]>(
      `/expenses/${expenseId}`
    );
    return { success: true, data: response };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

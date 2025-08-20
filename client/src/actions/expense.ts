"use server";

import { Expense } from "@/constants/expense";
import {
  getAuthenticatedClient,
  clientErrorHandler,
  TListResponse,
  TResponse,
} from "@/data/client";
import { revalidatePath } from "next/cache";

/**
 * Fetches the list of expenses from the server.
 *
 * @returns {Promise<TListResponse<Expense>>} A promise that resolves to the list of expenses and any error information.
 *
 **/
export async function getExpenses(): Promise<TListResponse<Expense>> {
  try {
    const client = await getAuthenticatedClient();
    const response = await client.get<TListResponse<Expense>>("/expenses");

    return response;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return {
      data: [],
      ...clientErrorHandler(error),
    };
  }
}

/**
 * Fetches an expense by its unique identifier.
 *
 * @param id - The unique identifier of the expense to retrieve.
 * @returns A promise that resolves to a `TResponse` object containing the expense data or an error message.
 */
export async function getExpensesById(id: string): Promise<TResponse<Expense>> {
  try {
    const client = await getAuthenticatedClient();
    const response = await client.get<TResponse<Expense>["data"]>(
      `/expenses/${id}`
    );
    return { success: true, data: response };
  } catch (error) {
    console.error("Error fetching expense by ID:", error);

    return {
      data: null,
      ...clientErrorHandler(error),
    };
  }
}

/**
 * Creates a new expense by sending a POST request to the server.
 *
 * @param expense - The expense object to be created.
 * @returns A promise that resolves to a TResponse object containing the result of the operation.
 *
 */
export async function createExpense(
  expense: Expense
): Promise<TResponse<Expense>> {
  try {
    const client = await getAuthenticatedClient();
    const response = await client.post<TResponse<Expense>["data"]>(
      "/expenses",
      expense
    );

    // Revalidate the expenses pages
    revalidatePath("/dashboard/expenses");

    return { success: true, data: response };
  } catch (error) {
    console.error("Error creating expense:", error);
    return {
      data: null,
      ...clientErrorHandler(error),
    };
  }
}

export async function updateExpense(
  expense: Expense,
  expenseId: string
): Promise<TResponse<Expense>> {
  try {
    const client = await getAuthenticatedClient();
    const response = await client.put<TResponse<Expense>["data"]>(
      `/expenses/${expenseId}`,
      expense
    );

    revalidatePath("/dashboard/expenses");

    return { success: true, data: response };
  } catch (error) {
    console.error("Error updating expense:", error);
    return {
      data: null,
      ...clientErrorHandler(error),
    };
  }
}

export async function deleteExpense(
  expenseId: string
): Promise<TResponse<Expense>> {
  try {
    const client = await getAuthenticatedClient();
    const response = await client.delete<TResponse<Expense>["data"]>(
      `/expenses/${expenseId}`
    );

    // Revalidate the expenses pages
    revalidatePath("/dashboard/expenses");
    return { success: true, data: response };
  } catch (error) {
    console.error("Error deleting expense:", error);

    return {
      data: null,
      ...clientErrorHandler(error),
    };
  }
}

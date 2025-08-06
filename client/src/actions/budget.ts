"use server";

import { Budget } from "@/constants/budget";
import { client } from "@/data/client";
import { revalidatePath } from "next/cache";

type ResponseWithError = {
  error?: string;
};

type TBudgetListResponse = {
  data: Budget[];
  total?: number;
  limit?: number;
  offset?: number;
} & ResponseWithError;

type TBudgetResponse = {
  data: Budget | null;
  success: boolean;
} & ResponseWithError;

/**
 * Fetches the list of budgets from the server.
 *
 * @returns {Promise<TBudgetListResponse>} A promise that resolves to the list of budgets and any error information.
 *
 **/
export async function getBudgets(): Promise<TBudgetListResponse> {
  try {
    const response = await client.get<TBudgetListResponse>("/budgets");

    return response;
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return {
      data: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Fetches a budget by its unique identifier.
 *
 * @param id - The unique identifier of the budget to retrieve.
 * @returns A promise that resolves to a `TBudgetResponse` object containing the budget data or an error message.
 */
export async function getBudgetById(id: string): Promise<TBudgetResponse> {
  try {
    const response = await client.get<TBudgetResponse["data"]>(
      `/budgets/${id}`
    );
    return { success: true, data: response };
  } catch (error) {
    console.error("Error fetching budget by ID:", error);
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Creates a new budget by sending a POST request to the server.
 *
 * @param budget - The budget object to be created.
 * @returns A promise that resolves to a TBudgetResponse object containing the result of the operation.
 *
 */
export async function createBudget(budget: Budget): Promise<TBudgetResponse> {
  try {
    const response = await client.post<TBudgetResponse["data"]>(
      "/budgets",
      budget
    );

    // Revalidate the budgets pages
    revalidatePath("/dashboard/budgets");
    if (response?.id) {
      revalidatePath(`/dashboard/budgets/${response.id}`, "page");
    }

    return { success: true, data: response };
  } catch (error) {
    console.error("Error creating budget:", error);
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateBudget(
  budget: Budget,
  budgetId: string
): Promise<TBudgetResponse> {
  try {
    const response = await client.put<TBudgetResponse["data"]>(
      `/budgets/${budgetId}`,
      budget
    );

    // Revalidate the budgets pages
    revalidatePath("/dashboard/budgets");
    revalidatePath(`/dashboard/budgets/${budgetId}`, "page");

    return { success: true, data: response };
  } catch (error) {
    console.error("Error updating budget:", error);
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function deleteBudget(budgetId: string): Promise<TBudgetResponse> {
  try {
    const response = await client.delete<TBudgetResponse["data"]>(
      `/budgets/${budgetId}`
    );

    // Revalidate the budgets pages
    revalidatePath("/dashboard/budgets");

    return { success: true, data: response };
  } catch (error) {
    console.error("Error deleting budget:", error);
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

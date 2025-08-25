"use server";

import { Budget } from "@/constants/budget";
import {
  getAuthenticatedClient,
  clientErrorHandler,
  TListResponse,
  TResponse,
  defaultListResponse,
} from "@/data/client";
import { revalidatePath } from "next/cache";

/**
 * Fetches the list of budgets from the server with pagination support.
 *
 * @param page - The page number (1-based)
 * @param pageSize - Number of items per page
 * @returns {Promise<TListResponse<Budget>>} A promise that resolves to the list of budgets and any error information.
 *
 **/
export async function getBudgets(
  page: number = 1,
  pageSize: number = 10
): Promise<TListResponse<Budget>> {
  try {
    const client = await getAuthenticatedClient();
    const offset = (page - 1) * pageSize; // Convert page to offset
    const url = `/budgets?limit=${pageSize}&offset=${offset}`;
    console.log(`Fetching budgets: ${url}`); // Debug log
    const response = await client.get<TListResponse<Budget>>(url);
    console.log(`Response:`, response); // Debug log

    return response;
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return {
      ...defaultListResponse,
      ...clientErrorHandler(error),
    };
  }
}

/**
 * Fetches a budget by its unique identifier.
 *
 * @param id - The unique identifier of the budget to retrieve.
 * @returns A promise that resolves to a `TResponse` object containing the budget data or an error message.
 */
export async function getBudgetById(id: string): Promise<TResponse<Budget>> {
  try {
    const client = await getAuthenticatedClient();
    const response = await client.get<TResponse<Budget>["data"]>(
      `/budgets/${id}`
    );
    return { success: true, data: response };
  } catch (error) {
    console.error("Error fetching budget by ID:", error);

    return {
      ...clientErrorHandler(error),
      data: null,
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
export async function createBudget(budget: Budget): Promise<TResponse<Budget>> {
  try {
    const client = await getAuthenticatedClient();
    const response = await client.post<TResponse<Budget>["data"]>(
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
      ...clientErrorHandler(error),
      data: null,
    };
  }
}

export async function updateBudget(
  budget: Budget,
  budgetId: string
): Promise<TResponse<Budget>> {
  try {
    const client = await getAuthenticatedClient();
    const response = await client.put<TResponse<Budget>["data"]>(
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
      ...clientErrorHandler(error),
      data: null,
    };
  }
}

export async function deleteBudget(
  budgetId: string
): Promise<TResponse<Budget>> {
  try {
    const client = await getAuthenticatedClient();
    const response = await client.delete<TResponse<Budget>["data"]>(
      `/budgets/${budgetId}`
    );

    // Revalidate the budgets pages
    revalidatePath("/dashboard/budgets");

    return { success: true, data: response };
  } catch (error) {
    console.error("Error deleting budget:", error);

    return {
      ...clientErrorHandler(error),
      data: null,
    };
  }
}

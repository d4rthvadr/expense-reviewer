"use server";

import { Transaction } from "@/constants/transaction";
import {
  getAuthenticatedClient,
  clientErrorHandler,
  TListResponse,
  TResponse,
  defaultListResponse,
} from "@/data/client";
import { revalidatePath } from "next/cache";

/**
 * Fetches the list of transactions from the server with pagination support.
 *
 * @param page - The page number (1-based)
 * @param limit - Number of items per page
 * @param type - Optional filter by transaction type (EXPENSE or INCOME)
 * @returns {Promise<TListResponse<Transaction>>} A promise that resolves to the list of transactions and any error information.
 *
 **/
export async function getTransactions(
  page: number = 1,
  limit: number = 10,
  type?: 'EXPENSE' | 'INCOME'
): Promise<TListResponse<Transaction>> {
  try {
    const client = await getAuthenticatedClient();

    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
    });
    
    if (type) {
      queryParams.set('type', type);
    }
    
    const url = `/transactions?${queryParams.toString()}`;
    const response = await client.get<TListResponse<Transaction>>(url);

    return response;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      ...defaultListResponse,
      ...clientErrorHandler(error),
    };
  }
}

/**
 * Fetches a transaction by its unique identifier.
 *
 * @param id - The unique identifier of the transaction to retrieve.
 * @returns A promise that resolves to a `TResponse` object containing the transaction data or an error message.
 */
export async function getTransactionById(id: string): Promise<TResponse<Transaction>> {
  try {
    const client = await getAuthenticatedClient();
    const response = await client.get<TResponse<Transaction>["data"]>(
      `/transactions/${id}`
    );
    return { success: true, data: response };
  } catch (error) {
    console.error("Error fetching transaction by ID:", error);

    return {
      data: null,
      ...clientErrorHandler(error),
    };
  }
}

/**
 * Creates a new transaction by sending a POST request to the server.
 *
 * @param transaction - The transaction object to be created.
 * @returns A promise that resolves to a TResponse object containing the result of the operation.
 *
 */
export async function createTransaction(
  transaction: Transaction
): Promise<TResponse<Transaction>> {
  try {
    const client = await getAuthenticatedClient();
    const response = await client.post<TResponse<Transaction>["data"]>(
      "/transactions",
      transaction
    );

    // Revalidate the transactions pages
    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/expenses"); // Keep for backward compatibility
    revalidatePath("/dashboard/income");

    return { success: true, data: response };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return {
      data: null,
      ...clientErrorHandler(error),
    };
  }
}

export async function updateTransaction(
  transaction: Transaction,
  transactionId: string
): Promise<TResponse<Transaction>> {
  try {
    const client = await getAuthenticatedClient();
    const response = await client.put<TResponse<Transaction>["data"]>(
      `/transactions/${transactionId}`,
      transaction
    );

    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/expenses"); // Keep for backward compatibility
    revalidatePath("/dashboard/income");

    return { success: true, data: response };
  } catch (error) {
    console.error("Error updating transaction:", error);
    return {
      data: null,
      ...clientErrorHandler(error),
    };
  }
}

export async function deleteTransaction(
  transactionId: string
): Promise<TResponse<Transaction>> {
  try {
    const client = await getAuthenticatedClient();
    const response = await client.delete<TResponse<Transaction>["data"]>(
      `/transactions/${transactionId}`
    );

    // Revalidate the transactions pages
    revalidatePath("/dashboard/transactions");
    revalidatePath("/dashboard/expenses"); // Keep for backward compatibility
    revalidatePath("/dashboard/income");
    
    return { success: true, data: response };
  } catch (error) {
    console.error("Error deleting transaction:", error);

    return {
      data: null,
      ...clientErrorHandler(error),
    };
  }
}

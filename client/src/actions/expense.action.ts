"use server";

import getClient from "@/data/client";

const client = getClient();
export async function getExpenses() {
  try {
    const response = await client.get("/expenses");

    return response;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

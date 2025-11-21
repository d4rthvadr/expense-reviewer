"use server";

import { getAuthenticatedClient } from "@/data/client";
import { Category } from "@/constants/category.enum";

// Types
export interface CategoryWeightItem {
  category: Category;
  weight: number;
  isCustom: boolean;
}

export interface GetCategoryWeightsResponse {
  success: boolean;
  data?: {
    weights: CategoryWeightItem[];
    totalCategories: number;
    customCount: number;
  };
  error?: string;
}

export interface UpdateCategoryWeightsPayload {
  weights: Array<{
    category: Category;
    weight: number;
  }>;
}

export interface UpdateCategoryWeightsResponse {
  success: boolean;
  data?: {
    weights: CategoryWeightItem[];
    totalCategories: number;
    customCount: number;
  };
  error?: string;
}

// Actions
export async function getCategoryWeights(): Promise<GetCategoryWeightsResponse> {
  try {
    const client = await getAuthenticatedClient();
    const data = await client.get<{
      weights: CategoryWeightItem[];
      totalCategories: number;
      customCount: number;
    }>("/preferences/category-weights");

    return {
      success: true,
      data,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      error: err.response?.data?.message || "Failed to fetch category weights",
    };
  }
}

export async function updateCategoryWeights(
  payload: UpdateCategoryWeightsPayload
): Promise<UpdateCategoryWeightsResponse> {
  try {
    const client = await getAuthenticatedClient();
    const data = await client.patch<{
      weights: CategoryWeightItem[];
      totalCategories: number;
      customCount: number;
    }>("/preferences/category-weights", payload);

    return {
      success: true,
      data,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      error: err.response?.data?.message || "Failed to update category weights",
    };
  }
}

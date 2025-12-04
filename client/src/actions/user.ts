"use server";

import {
  clientErrorHandler,
  getAuthenticatedClient,
  TResponse,
} from "@/data/client";

export interface OnboardingStatus {
  hasSeenWelcome: boolean;
  hasCustomizedCategoryWeights: boolean;
}

/**
 * Fetches the user's onboarding status
 */
export async function getOnboardingStatus(): Promise<
  TResponse<OnboardingStatus>
> {
  try {
    const client = await getAuthenticatedClient();
    const response = await client.get<OnboardingStatus>(
      "/users/me/onboarding-status"
    );

    console.log("Onboarding status response:", response);

    return {
      success: true,
      data: response as OnboardingStatus,
    };
  } catch (error) {
    console.error("Failed to load onboarding status:", error);
    return {
      data: null,
      ...clientErrorHandler(error),
    };
  }
}

/**
 * Marks the welcome banner as seen for the authenticated user
 */
export async function markWelcomeSeen(): Promise<TResponse<void>> {
  try {
    const client = await getAuthenticatedClient();
    await client.patch("/users/me/welcome", {});

    console.log("Marked welcome as seen successfully.");

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.log("Error marking welcome as seen:", error);
    return {
      data: null,
      ...clientErrorHandler(error),
    };
  }
}

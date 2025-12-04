/**
 * Onboarding storage utilities for managing client-side banner state
 */

const CATEGORY_WEIGHT_DISMISS_KEY = "onboarding.categoryWeightDismissedAt";
const SNOOZE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Store the timestamp when the category weight banner was dismissed
 */
export function setCategoryWeightDismissed(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CATEGORY_WEIGHT_DISMISS_KEY, Date.now().toString());
  } catch (error) {
    console.error("Failed to save category weight dismiss state:", error);
  }
}

/**
 * Get the timestamp when the category weight banner was last dismissed
 * Returns null if never dismissed
 */
export function getCategoryWeightDismissedAt(): number | null {
  if (typeof window === "undefined") return null;

  try {
    const timestamp = localStorage.getItem(CATEGORY_WEIGHT_DISMISS_KEY);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    console.error("Failed to read category weight dismiss state:", error);
    return null;
  }
}

/**
 * Check if the category weight banner should be shown
 * Returns true if:
 * - Never dismissed, OR
 * - Dismissed but 30 minutes have elapsed
 */
export function shouldShowCategoryWeightBanner(
  hasCustomizedWeights: boolean
): boolean {
  // If user has already customized weights, never show the banner
  if (hasCustomizedWeights) {
    return false;
  }

  const dismissedAt = getCategoryWeightDismissedAt();

  // Never dismissed - show the banner
  if (dismissedAt === null) {
    return true;
  }

  // Check if snooze period has elapsed
  const now = Date.now();
  const elapsedMs = now - dismissedAt;
  return elapsedMs >= SNOOZE_DURATION_MS;
}

/**
 * Clear the category weight dismiss state (useful for testing or reset)
 */
export function clearCategoryWeightDismiss(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(CATEGORY_WEIGHT_DISMISS_KEY);
  } catch (error) {
    console.error("Failed to clear category weight dismiss state:", error);
  }
}

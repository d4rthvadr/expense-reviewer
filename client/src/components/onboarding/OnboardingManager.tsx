"use client";

import { useEffect, useState } from "react";
import WelcomeBanner from "./WelcomeBanner";
import CategoryWeightBanner from "./CategoryWeightBanner";
import { getOnboardingStatus, type OnboardingStatus } from "@/actions/user";
import { shouldShowCategoryWeightBanner } from "@/lib/onboarding-storage";

/**
 * OnboardingManager - Orchestrates banner display logic
 * Shows welcome banner first (one-time), then category weight banner (persistent)
 */
export default function OnboardingManager() {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showCategoryWeight, setShowCategoryWeight] = useState(false);

  // TODO: refactor to use hooks instead of direct useEffect
  useEffect(() => {
    async function loadOnboardingStatus() {
      try {
        const response = await getOnboardingStatus();

        console.log("OnboardingManager loaded status:", response);

        if (response.success && response.data) {
          setStatus(response.data);

          // Show welcome banner if user hasn't seen it
          setShowWelcome(!response.data.hasSeenWelcome);

          // Show category weight banner if:
          // - User has seen welcome (sequential display)
          // - User hasn't customized weights
          // - Local storage timer allows it (30 min elapsed)
          if (response.data.hasSeenWelcome) {
            const shouldShow = shouldShowCategoryWeightBanner(
              response.data.hasCustomizedCategoryWeights
            );
            setShowCategoryWeight(shouldShow);
          }
        }
      } catch (error) {
        console.error("Failed to load onboarding status:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadOnboardingStatus();
  }, []);

  const handleWelcomeDismiss = () => {
    setShowWelcome(false);

    // After welcome is dismissed, check if we should show category weight banner
    if (status && !status.hasCustomizedCategoryWeights) {
      const shouldShow = shouldShowCategoryWeightBanner(
        status.hasCustomizedCategoryWeights
      );
      setShowCategoryWeight(shouldShow);
    }
  };

  const handleCategoryWeightDismiss = () => {
    setShowCategoryWeight(false);
  };

  // Don't render anything while loading
  if (isLoading) {
    return null;
  }

  // Don't render wrapper if no banners to show
  if (!showWelcome && !showCategoryWeight) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {showWelcome && <WelcomeBanner onDismiss={handleWelcomeDismiss} />}
      {!showWelcome && showCategoryWeight && (
        <CategoryWeightBanner onDismiss={handleCategoryWeightDismiss} />
      )}
    </div>
  );
}

OnboardingManager.displayName = "OnboardingManager";

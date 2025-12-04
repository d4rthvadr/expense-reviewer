"use client";

import { useState } from "react";
import { X, Info, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { setCategoryWeightDismissed } from "@/lib/onboarding-storage";

interface CategoryWeightBannerProps {
  onDismiss: () => void;
}

/**
 * CategoryWeightBanner - Persistent CTA banner for category weight setup
 * Can be snoozed for 30 minutes, persists until user customizes weights
 */
export default function CategoryWeightBanner({
  onDismiss,
}: CategoryWeightBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();

  const handleSetupNow = () => {
    router.push("/dashboard/settings?tab=category-weights");
  };

  const handleSnooze = () => {
    setCategoryWeightDismissed();
    setIsVisible(false);
    onDismiss();
  };

  const handleDismiss = () => {
    handleSnooze();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Card className="relative bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 mb-6">
      <div className="px-6 py-5">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss category weight banner</span>
        </Button>

        <div className="flex items-start gap-4 pr-8">
          <div className="flex-shrink-0 mt-1">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                Customize Your Spending Preferences
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Set up category weights to get personalized insights on how your
                spending aligns with your priorities. We&apos;ll notify you when
                you&apos;re spending more than expected in specific categories.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSetupNow}
              >
                <Settings className="w-4 h-4 mr-2" />
                Set Up Now
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={handleSnooze}
              >
                Remind me later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

CategoryWeightBanner.displayName = "CategoryWeightBanner";

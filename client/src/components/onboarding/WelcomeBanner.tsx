"use client";

import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { markWelcomeSeen } from "@/actions/user";

interface WelcomeBannerProps {
  onDismiss: () => void;
}

/**
 * WelcomeBanner - One-time celebratory banner for new users
 * Dismisses permanently after user closes it
 */
export default function WelcomeBanner({ onDismiss }: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleDismiss = async () => {
    setIsLoading(true);

    try {
      const response = await markWelcomeSeen();

      if (response.success) {
        setIsVisible(false);
        onDismiss();
      } else {
        console.error("Failed to mark welcome as seen:", response.error);
        // Still dismiss locally even if server fails
        setIsVisible(false);
        onDismiss();
      }
    } catch (error) {
      console.error("Error dismissing welcome banner:", error);
      // Still dismiss locally
      setIsVisible(false);
      onDismiss();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Card className="relative bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border-violet-200 dark:border-violet-800 mb-6 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-400/20 to-pink-400/20 rounded-full blur-3xl -translate-y-8 translate-x-8"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-blue-400/20 rounded-full blur-2xl translate-y-8 -translate-x-8"></div>

      <div className="relative px-6 py-5">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/50"
          onClick={handleDismiss}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss welcome banner</span>
        </Button>

        <div className="flex items-start gap-4 pr-8">
          <div className="flex-shrink-0 mt-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Welcome to Your Expense Tracker! 🎉
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
              We&apos;re excited to help you take control of your finances!
              Track expenses, analyze spending patterns, set budgets, and
              receive smart insights—all in one place. Let&apos;s get started on
              your journey to financial clarity.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

WelcomeBanner.displayName = "WelcomeBanner";

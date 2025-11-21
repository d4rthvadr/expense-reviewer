import React from "react";
import CategoryWeightsManager from "@/components/category-weights-manager";
import { Toaster } from "@/components/ui/sonner";

function SettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Toaster />
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8">
        Settings
      </h1>

      <div className="max-w-4xl">
        <div className="bg-primary-foreground p-4 sm:p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Category Weights</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Manage your category spending preferences. These weights help track
            how your actual spending compares to your targets.
          </p>

          <CategoryWeightsManager />
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;

SettingsPage.displayName = "SettingsPage";

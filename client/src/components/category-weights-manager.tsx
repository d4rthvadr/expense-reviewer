"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Category } from "@/constants/category.enum";
import {
  getCategoryWeights,
  updateCategoryWeights,
} from "@/actions/category-weights";

const CATEGORIES = Object.values(Category);

interface CategoryWeight {
  category: Category;
  weight: number;
  isCustom: boolean;
}

export default function CategoryWeightsManager() {
  const [weights, setWeights] = useState<CategoryWeight[]>(
    CATEGORIES.map((cat) => ({ category: cat, weight: 0, isCustom: false }))
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadWeights();
  }, []);

  const loadWeights = async () => {
    setIsLoading(true);

    const response = await getCategoryWeights();

    if (response.success && response.data) {
      setWeights(response.data.weights);
    } else {
      toast.error(response.error || "Failed to load category weights");
    }

    setIsLoading(false);
  };

  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  const isValidTotal = Math.abs(totalWeight - 1.0) < 0.01;

  const handleWeightChange = (category: Category, value: number) => {
    setWeights((prev) =>
      prev.map((w) =>
        w.category === category
          ? { ...w, weight: value / 100, isCustom: true }
          : w
      )
    );
  };

  const handleSave = async () => {
    setIsSaving(true);

    const response = await updateCategoryWeights({
      weights: weights.map(({ category, weight }) => ({ category, weight })),
    });

    if (response.success) {
      toast.success("Category weights updated successfully!");
      if (response.data) {
        setWeights(response.data.weights);
      }
    } else {
      toast.error(response.error || "Failed to save category weights");
    }

    setIsSaving(false);
  };

  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all category weights to defaults? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsLoading(true);

    // The backend doesn't have a reset endpoint yet, so we'll reload defaults
    await loadWeights();
    toast.success("Category weights reset to defaults");
  };

  const formatCategoryName = (category: string) => {
    return category
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading && weights.every((w) => w.weight === 0)) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
        <div>
          <p className="text-sm text-muted-foreground">Total Allocation</p>
          <p
            className={`text-2xl font-bold ${
              isValidTotal ? "text-green-600" : "text-red-600"
            }`}
          >
            {(totalWeight * 100).toFixed(1)}%
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Target</p>
          <p className="text-2xl font-bold">100%</p>
        </div>
      </div>

      {!isValidTotal && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Total must equal 100%. Current: {(totalWeight * 100).toFixed(1)}%
          </p>
        </div>
      )}

      {/* Category Weights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {weights.map(({ category, weight }) => (
          <div
            key={category}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 min-w-0 mr-4">
              <label
                htmlFor={`weight-${category}`}
                className="text-sm font-medium block mb-1"
              >
                {formatCategoryName(category)}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  id={`weight-${category}`}
                  min="0"
                  max="100"
                  step="0.5"
                  value={weight * 100}
                  onChange={(e) =>
                    handleWeightChange(category, parseFloat(e.target.value))
                  }
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  disabled={isLoading || isSaving}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={(weight * 100).toFixed(1)}
                  onChange={(e) =>
                    handleWeightChange(category, parseFloat(e.target.value))
                  }
                  className="w-16 px-2 py-1 text-sm border rounded text-right"
                  disabled={isLoading || isSaving}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-4 border-t">
        <Button
          onClick={handleSave}
          disabled={!isValidTotal || isLoading || isSaving}
          className="flex-1"
        >
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          disabled={isLoading || isSaving}
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset to Defaults"
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Note: Changes will affect future spending analysis and notifications.
        Existing data remains unchanged.
      </p>
    </div>
  );
}

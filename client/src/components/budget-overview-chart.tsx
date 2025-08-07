"use client";
import React, { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getBudgetData, type BudgetData } from "@/actions/analytics";
import ErrorBoundary from "@/components/error-boundary";
import ChartSkeleton from "@/components/chart-skeleton";

const chartConfig = {
  budgetAmount: {
    label: "Budget Amount",
    color: "#10b981",
  },
} satisfies ChartConfig;

// Helper function to format category names for display
const formatCategoryName = (category: string): string => {
  return category
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

interface ChartData {
  category: string;
  categoryLabel: string;
  budgetAmount: number;
  currency: string;
}

const BudgetOverviewChart = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch budget data
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getBudgetData();

      if (response.success && response.data) {
        const chartData: ChartData[] = response.data.map(
          (item: BudgetData) => ({
            category: item.category,
            categoryLabel: formatCategoryName(item.category),
            budgetAmount: item.budgetAmount,
            currency: item.currency,
          })
        );

        setData(chartData);
      } else {
        setError(response.error || "Failed to load budget data");
        setData([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load budget data"
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Chart content
  const ChartContent = () => {
    if (loading) return <ChartSkeleton />;

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Failed to load budget data
          </p>
          <p className="text-xs text-muted-foreground mb-4">{error}</p>
          <button
            className="px-3 py-1 text-xs border rounded hover:bg-gray-50"
            onClick={fetchData}
          >
            Retry
          </button>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
          <p className="text-sm text-muted-foreground">
            No budget data available
          </p>
        </div>
      );
    }

    return (
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="categoryLabel"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            angle={data.length > 5 ? -45 : 0}
            textAnchor={data.length > 5 ? "end" : "middle"}
            height={data.length > 5 ? 60 : 30}
            fontSize={12}
          />
          <YAxis
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
            fontSize={12}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value, name) => [`$${value}`, name]}
                labelFormatter={(label) => `${label} Budget`}
              />
            }
          />
          <Bar
            dataKey="budgetAmount"
            fill="var(--color-budgetAmount)"
            radius={4}
            name="Budget Amount"
          />
        </BarChart>
      </ChartContainer>
    );
  };

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-lg font-medium">Budget Overview</h1>
        </div>
        <ChartContent />
      </div>
    </ErrorBoundary>
  );
};

BudgetOverviewChart.displayName = "BudgetOverviewChart";
export default BudgetOverviewChart;

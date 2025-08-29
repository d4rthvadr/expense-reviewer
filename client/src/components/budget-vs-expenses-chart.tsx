"use client";
import React, { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Calendar } from "lucide-react";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BudgetVsTransactionData,
  getBudgetVsTransactionData,
} from "@/actions/analytics";
import ErrorBoundary from "@/components/error-boundary";
import ChartSkeleton from "@/components/chart-skeleton";

const chartConfig = {
  budgetAmount: {
    label: "Budget",
    color: "#10b981",
  },
  expenseAmount: {
    label: "Expenses",
    color: "#3b82f6",
  },
  remaining: {
    label: "Remaining",
    color: "#e5e7eb",
  },
} satisfies ChartConfig;

// Helper function to format category names for display
const formatCategoryName = (category: string): string => {
  return category
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

// Helper function to get default date range (last 30 days)
const getDefaultDateRange = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  return {
    dateFrom: thirtyDaysAgo.toISOString().split("T")[0],
    dateTo: today.toISOString().split("T")[0],
  };
};

interface ChartData {
  category: string;
  categoryLabel: string;
  expenseAmount: number;
  remainingBudget: number;
  totalBudget: number;
  status: string;
  utilizationPercentage: number;
  currency: string;
}

interface StatusSummary {
  underBudget: number;
  onBudget: number;
  overBudget: number;
  noBudget: number;
}

const StatusSummaryCards = ({
  statusSummary,
}: {
  statusSummary: StatusSummary;
}) => {
  const cards = [
    {
      label: "Under Budget",
      count: statusSummary.underBudget,
      color: "bg-green-100 text-green-800",
      icon: "✓",
    },
    {
      label: "On Budget",
      count: statusSummary.onBudget,
      color: "bg-yellow-100 text-yellow-800",
      icon: "=",
    },
    {
      label: "Over Budget",
      count: statusSummary.overBudget,
      color: "bg-red-100 text-red-800",
      icon: "!",
    },
    {
      label: "No Budget",
      count: statusSummary.noBudget,
      color: "bg-gray-100 text-gray-800",
      icon: "?",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.color} p-3 rounded-lg text-center`}
        >
          <div className="text-lg font-semibold">
            {card.icon} {card.count}
          </div>
          <div className="text-xs">{card.label}</div>
        </div>
      ))}
    </div>
  );
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartData;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-medium">{label}</p>
        <p className="text-green-600">
          Total Budget: ${data.totalBudget.toFixed(2)}
        </p>
        <p className="text-blue-600">
          Expenses: ${data.expenseAmount.toFixed(2)}
        </p>
        <p className="text-gray-600">
          Remaining: ${data.remainingBudget.toFixed(2)}
        </p>
        <p className="text-sm text-gray-600">
          Utilization: {data.utilizationPercentage.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
};

const BudgetVsTransactionsChart = () => {
  const [data, setData] = useState<BudgetVsTransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(getDefaultDateRange());

  // Calculate status summary
  const getStatusSummary = (data: BudgetVsTransactionData[]): StatusSummary => {
    return data.reduce(
      (acc, item) => {
        switch (item.status) {
          case "UNDER_BUDGET":
            acc.underBudget++;
            break;
          case "ON_BUDGET":
            acc.onBudget++;
            break;
          case "OVER_BUDGET":
            acc.overBudget++;
            break;
          case "NO_BUDGET":
            acc.noBudget++;
            break;
        }
        return acc;
      },
      { underBudget: 0, onBudget: 0, overBudget: 0, noBudget: 0 }
    );
  };

  // Fetch data function
  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    console.log("Fetching budget vs expense data for:", dateRange); // Debug log

    try {
      const response = await getBudgetVsTransactionData(
        dateRange.dateFrom,
        dateRange.dateTo
      );

      console.log("API Response:", response); // Debug log

      if (response.success && response.data) {
        console.log("Setting data:", response.data); // Debug log
        setData(response.data);
      } else {
        console.log("API Error:", response.error); // Debug log
        setError(response.error || "Failed to load budget vs expense data");
        setData([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err); // Debug log
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load budget vs expense data"
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Load initial data and refetch when date range changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Prepare chart data for stacked bars
  const chartData: ChartData[] = data.map((item) => {
    // For categories with no budget, we'll show only expenses
    const remainingBudget =
      item.budgetAmount > 0
        ? Math.max(0, item.budgetAmount - item.transactionAmount)
        : 0;
    const totalBudget = Math.max(item.budgetAmount, item.transactionAmount); // Show at least the expense amount

    return {
      category: item.category,
      categoryLabel: formatCategoryName(item.category),
      expenseAmount: item.transactionAmount,
      remainingBudget,
      totalBudget,
      status: item.status,
      utilizationPercentage: item.utilizationPercentage,
      currency: item.currency,
    };
  });

  console.log("Chart data:", chartData); // Debug log
  console.log("Raw data:", data); // Debug log

  const statusSummary = getStatusSummary(data);

  // Handle date changes
  const handleDateFromChange = (date: Date | undefined) => {
    if (date) {
      setDateRange((prev) => ({
        ...prev,
        dateFrom: date.toISOString().split("T")[0],
      }));
    }
  };

  const handleDateToChange = (date: Date | undefined) => {
    if (date) {
      setDateRange((prev) => ({
        ...prev,
        dateTo: date.toISOString().split("T")[0],
      }));
    }
  };

  // Chart content
  const ChartContent = () => {
    if (loading) return <ChartSkeleton />;

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Failed to load budget vs expense data
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
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <p className="text-sm text-muted-foreground">
            No budget vs expense data available for the selected period
          </p>
        </div>
      );
    }

    return (
      <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="categoryLabel"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={12}
            interval={0}
          />
          <YAxis
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
            fontSize={12}
          />
          <ChartTooltip content={<CustomTooltip />} />
          <Bar
            dataKey="expenseAmount"
            stackId="budget"
            fill="var(--color-expenseAmount)"
            name="Expenses"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="remainingBudget"
            stackId="budget"
            fill="var(--color-remaining)"
            name="Remaining Budget"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    );
  };

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-lg font-medium">Budget vs Expenses</h1>

          <div className="flex flex-col sm:flex-row gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  From: {new Date(dateRange.dateFrom).toLocaleDateString()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <DatePicker
                  date={new Date(dateRange.dateFrom)}
                  onSetDate={handleDateFromChange}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  To: {new Date(dateRange.dateTo).toLocaleDateString()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <DatePicker
                  date={new Date(dateRange.dateTo)}
                  onSetDate={handleDateToChange}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <StatusSummaryCards statusSummary={statusSummary} />

        <ChartContent />
      </div>
    </ErrorBoundary>
  );
};

BudgetVsTransactionsChart.displayName = "BudgetVsTransactionsChart";
export default BudgetVsTransactionsChart;

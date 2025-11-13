"use client";
import React, { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Filter } from "lucide-react";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getTransactionsOverTime,
  type AnalyticsFilters,
} from "@/actions/analytics";
import ErrorBoundary from "@/components/error-boundary";
import ChartSkeleton from "@/components/chart-skeleton";
import { toast } from "sonner";

const chartConfig = {
  totalAmount: {
    label: "Total Expenses",
    color: "#2563eb",
  },
} satisfies ChartConfig;

// Helper function to format period labels for display
const formatPeriodLabel = (period: string, groupBy: string): string => {
  switch (groupBy) {
    case "day":
      return new Date(period).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    case "week":
      // Convert "2024-W01" to "Week 1"
      const weekMatch = period.match(/(\d{4})-W(\d{2})/);
      return weekMatch ? `Week ${parseInt(weekMatch[2])}` : period;
    case "month":
      return new Date(period + "-01").toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    default:
      return period;
  }
};

// Helper function to get default date range
const getDefaultDateRange = () => {
  const dateTo = new Date();
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - 30); // Last 30 days

  return {
    dateFrom: dateFrom.toISOString().split("T")[0],
    dateTo: dateTo.toISOString().split("T")[0],
  };
};

interface ChartData {
  period: string;
  periodLabel: string;
  totalAmount: number;
  expenseCount: number;
}

const TotalExpenseChart = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    ...getDefaultDateRange(),
    groupBy: "week",
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Fetch data function
  const fetchData = async (currentFilters: AnalyticsFilters) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getTransactionsOverTime(currentFilters);

      if (response.success && response.data) {
        const chartData: ChartData[] = response.data.map((item) => ({
          period: item.period,
          periodLabel: formatPeriodLabel(item.period, currentFilters.groupBy),
          totalAmount: item.totalAmount,
          expenseCount: item.transactionCount,
        }));

        setData(chartData);
      } else {
        const errMessage = response.error || "Failed to fetch data";
        setError(errMessage);
        toast.error(errMessage);
        setData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchData(filters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle filter changes
  const handleFiltersChange = (newFilters: Partial<AnalyticsFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchData(updatedFilters);
    setFiltersOpen(false);
  };

  // Filter toolbar component
  const FilterToolbar = () => (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="flex flex-col sm:flex-row gap-2 flex-1">
        <DatePicker
          date={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
          onSetDate={(date) =>
            handleFiltersChange({
              dateFrom: date?.toISOString().split("T")[0],
            })
          }
          placeholder="From date"
          showLabel={false}
          label="From"
        />
        <DatePicker
          date={filters.dateTo ? new Date(filters.dateTo) : undefined}
          onSetDate={(date) =>
            handleFiltersChange({
              dateTo: date?.toISOString().split("T")[0],
            })
          }
          placeholder="To date"
          showLabel={false}
          label="To"
        />
      </div>
      <Select
        value={filters.groupBy}
        onValueChange={(value) =>
          handleFiltersChange({ groupBy: value as "day" | "week" | "month" })
        }
      >
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Daily</SelectItem>
          <SelectItem value="week">Weekly</SelectItem>
          <SelectItem value="month">Monthly</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  // Chart content
  const ChartContent = () => {
    if (loading) return <ChartSkeleton />;

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
          <p className="text-sm text-muted-foreground mb-2">
            {error ?? "Failed to load expenses data"}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(filters)}
          >
            Retry
          </Button>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
          <p className="text-sm text-muted-foreground">
            No expense data available for the selected period
          </p>
        </div>
      );
    }

    return (
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="periodLabel"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            angle={data.length > 7 ? -45 : 0}
            textAnchor={data.length > 7 ? "end" : "middle"}
            height={data.length > 7 ? 60 : 30}
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
                labelFormatter={(label, payload) =>
                  payload?.[0]?.payload
                    ? `${label} (${payload[0].payload.expenseCount} expenses)`
                    : label
                }
              />
            }
          />
          <Bar
            dataKey="totalAmount"
            fill="var(--color-totalAmount)"
            radius={4}
            name="Total Expenses"
          />
        </BarChart>
      </ChartContainer>
    );
  };

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-lg font-medium">Total Expenses</h1>
          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">Filter Expenses</h4>
                <FilterToolbar />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <ChartContent />
      </div>
    </ErrorBoundary>
  );
};

TotalExpenseChart.displayName = "TotalExpenseChart";
export default TotalExpenseChart;

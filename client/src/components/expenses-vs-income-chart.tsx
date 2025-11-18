"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getExpensesVsIncome,
  ExpensesVsIncomeData,
  ExpensesVsIncomeFilters,
} from "@/actions/analytics";
import ChartSkeleton from "./chart-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ExpensesVsIncomeChart() {
  const [data, setData] = useState<ExpensesVsIncomeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<"week" | "month">("month");
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalNet, setTotalNet] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const filters: ExpensesVsIncomeFilters = {
        groupBy,
      };

      const response = await getExpensesVsIncome(filters);

      if (response.success && response.data) {
        setData(response.data);
        
        if (response.meta) {
          setTotalExpenses(response.meta.totalExpenses || 0);
          setTotalIncome(response.meta.totalIncome || 0);
          setTotalNet(response.meta.totalNet || 0);
        } else if (response.data.length > 0) {
          const lastPeriod = response.data[response.data.length - 1];
          setTotalExpenses(lastPeriod.cumulativeExpenses);
          setTotalIncome(lastPeriod.cumulativeIncome);
          setTotalNet(lastPeriod.cumulativeNet);
        }
      } else {
        setError(response.message || "Failed to load expenses vs income data");
      }

      setLoading(false);
    };

    fetchData();
  }, [groupBy]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTooltipValue = (value: number) => {
    return formatCurrency(value);
  };

  if (loading) {
    return <ChartSkeleton />;
  }

  if (error) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center">
        <p className="text-muted-foreground">No transaction data available</p>
        <p className="text-sm text-muted-foreground mt-2">
          Start adding transactions to see your financial trends
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Expenses vs Income</h2>
        <Select
          value={groupBy}
          onValueChange={(value) => setGroupBy(value as "week" | "month")}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Group by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-lg font-bold text-red-500">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Total Income</p>
          <p className="text-lg font-bold text-green-500">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Net</p>
          <p
            className={`text-lg font-bold ${
              totalNet >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {formatCurrency(totalNet)}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="periodLabel"
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            className="text-xs"
            tick={{ fontSize: 12 }}
            tickFormatter={formatCurrency}
          />
          <Tooltip
            formatter={formatTooltipValue}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="cumulativeExpenses"
            stroke="#ef4444"
            strokeWidth={2}
            name="Cumulative Expenses"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="cumulativeIncome"
            stroke="#22c55e"
            strokeWidth={2}
            name="Cumulative Income"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="cumulativeNet"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Cumulative Net"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

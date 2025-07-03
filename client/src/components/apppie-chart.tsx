"use client";
import React from "react";
import { TrendingUp } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Pie, PieChart } from "recharts";

export const description = "A pie chart with a label";
const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

const AppPieChart = () => {
  return (
    <div className="bg-primary-foreground p-4 rounded-lg">
      <h1 className="text-lg font-medium mb-6">Total Visitors</h1>

      <ChartContainer
        config={chartConfig}
        className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
      >
        <PieChart width={400} height={400}>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie data={chartData} dataKey="visitors" nameKey={"browser"} label />
        </PieChart>
      </ChartContainer>

      <div className="flex items-center gap-2 leading-none font-medium">
        Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
      </div>
      <div className="text-muted-foreground leading-none">
        Showing total visitors for the last 6 months
      </div>
    </div>
  );
};

AppPieChart.displayName = "AppPieChart";

export default AppPieChart;

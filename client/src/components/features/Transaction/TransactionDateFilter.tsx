"use client";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";

interface TransactionDateFilterProps {
  onDateChange: (dateFrom: Date | undefined, dateTo: Date | undefined) => void;
}

const TransactionDateFilter = ({
  onDateChange,
}: TransactionDateFilterProps) => {
  // Get default date range (last 30 days)
  const getDefaultDateRange = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return { dateFrom: thirtyDaysAgo, dateTo: today };
  };

  const defaultRange = getDefaultDateRange();
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    defaultRange.dateFrom
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(defaultRange.dateTo);

  // Notify parent on date change
  useEffect(() => {
    onDateChange(dateFrom, dateTo);
  }, [dateFrom, dateTo, onDateChange]);

  const presets = [
    {
      label: "Last 7 days",
      getValue: () => {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        return { dateFrom: sevenDaysAgo, dateTo: today };
      },
    },
    {
      label: "Last 30 days",
      getValue: () => {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return { dateFrom: thirtyDaysAgo, dateTo: today };
      },
    },
    {
      label: "Last 90 days",
      getValue: () => {
        const today = new Date();
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(today.getDate() - 90);
        return { dateFrom: ninetyDaysAgo, dateTo: today };
      },
    },
    {
      label: "This month",
      getValue: () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        return { dateFrom: firstDay, dateTo: today };
      },
    },
    {
      label: "Last month",
      getValue: () => {
        const today = new Date();
        const firstDayLastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        const lastDayLastMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        );
        return { dateFrom: firstDayLastMonth, dateTo: lastDayLastMonth };
      },
    },
    {
      label: "This year",
      getValue: () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), 0, 1);
        return { dateFrom: firstDay, dateTo: today };
      },
    },
  ];

  const applyPreset = (preset: (typeof presets)[0]) => {
    const { dateFrom: from, dateTo: to } = preset.getValue();
    setDateFrom(from);
    setDateTo(to);
  };

  const formatDateRange = () => {
    if (!dateFrom || !dateTo) return "Select date range";

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    return `${formatDate(dateFrom)} - ${formatDate(dateTo)}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">{formatDateRange()}</span>
          <span className="sm:hidden">Date Range</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex flex-col sm:flex-row">
          {/* Presets */}
          <div className="border-b sm:border-b-0 sm:border-r border-border p-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Quick Select
            </p>
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => applyPreset(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Date Pickers */}
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <DatePicker
                date={dateFrom}
                onSetDate={setDateFrom}
                showLabel={false}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <DatePicker
                date={dateTo}
                onSetDate={setDateTo}
                showLabel={false}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TransactionDateFilter;

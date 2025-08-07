"use client";

import React from "react";

export function ChartSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Title skeleton */}
      <div className="h-6 bg-muted rounded mb-6 w-32"></div>

      {/* Chart area skeleton */}
      <div className="min-h-[200px] w-full flex items-end justify-between gap-2 px-4">
        {/* Simulated bars */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted rounded-t flex-1 animate-pulse"
            style={{
              height: `${Math.random() * 120 + 40}px`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* X-axis labels skeleton */}
      <div className="flex justify-between mt-2 px-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-3 bg-muted rounded w-8"></div>
        ))}
      </div>
    </div>
  );
}

export default ChartSkeleton;

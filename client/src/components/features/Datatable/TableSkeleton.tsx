"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  /** Number of skeleton rows to display. Defaults to 5. */
  rows?: number;
  /** Number of skeleton columns to display. Defaults to 5. */
  columns?: number;
}

/**
 * TableSkeleton component that displays a loading skeleton for DataTable
 * Follows the same design pattern as ChartSkeleton with animate-pulse and staggered delays
 */

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  // Create different skeleton patterns for different column types
  const getSkeletonWidth = (colIndex: number) => {
    const patterns = [
      "w-20", // Category (short)
      "w-24", // Amount (medium)
      "w-28", // Date (medium-long)
      "w-16", // Edit button (short)
      "w-32", // Extra columns (medium)
    ];
    return patterns[colIndex % patterns.length];
  };

  return (
    <div className="animate-pulse">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i}>
                  <div
                    className={`h-4 bg-muted rounded ${getSkeletonWidth(i)}`}
                    style={{
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <div
                      className={`h-4 bg-muted rounded animate-pulse ${getSkeletonWidth(
                        colIndex
                      )}`}
                      style={{
                        animationDelay: `${
                          (rowIndex * columns + colIndex) * 0.05
                        }s`,
                      }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center space-x-2">
          <div className="h-4 bg-muted rounded w-32 animate-pulse" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 bg-muted rounded w-16 animate-pulse" />
          <div className="h-8 bg-muted rounded w-8 animate-pulse" />
          <div className="h-4 bg-muted rounded w-12 animate-pulse" />
          <div className="h-8 bg-muted rounded w-8 animate-pulse" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 bg-muted rounded w-24 animate-pulse" />
          <div className="h-8 bg-muted rounded w-20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default TableSkeleton;

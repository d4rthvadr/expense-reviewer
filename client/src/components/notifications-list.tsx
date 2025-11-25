"use client";

import React, { useEffect, useState, useCallback } from "react";
import { RefreshCw, AlertCircle, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNotifications, NotificationItem } from "@/actions/notification";
import { getSeverityColor, getSeverityLabel } from "@/constants/notifications";
import { formatRelativeTime } from "@/lib/time";

const DEFAULT_LIMIT = 20;

const NotificationsList = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Fetch notifications list
  const fetchNotifications = useCallback(async (cursor?: string) => {
    const isLoadingMoreRequest = !!cursor;
    if (isLoadingMoreRequest) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    const response = await getNotifications({
      limit: DEFAULT_LIMIT,
      cursor,
    });

    if (response.success) {
      if (isLoadingMoreRequest) {
        setNotifications((prev) => [...prev, ...response.data]);
      } else {
        setNotifications(response.data);
      }
      setHasMore(response.data.length === DEFAULT_LIMIT);
    } else {
      setError(response.error || "Failed to load notifications");
    }

    setIsLoading(false);
    setIsLoadingMore(false);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleLoadMore = () => {
    if (notifications.length > 0 && !isLoadingMore) {
      const lastNotification = notifications[notifications.length - 1];
      fetchNotifications(lastNotification.id);
    }
  };

  const handleRetry = () => {
    fetchNotifications();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading notifications...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-start gap-3 p-4 text-sm border rounded-lg bg-red-50 dark:bg-red-950"
        role="alert"
      >
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-red-700 dark:text-red-300 font-medium mb-1">
            Failed to load notifications
          </p>
          <p className="text-red-600 dark:text-red-400 text-xs mb-2">{error}</p>
          <Button
            onClick={handleRetry}
            variant="outline"
            size="sm"
            className="text-red-600 dark:text-red-400 border-red-600 dark:border-red-400"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-1">No notifications yet</p>
        <p className="text-sm text-muted-foreground">
          We&apos;ll notify you when something important happens
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {notifications.map((notification) => {
          const severityColors = getSeverityColor(notification.severity);
          return (
            <div
              key={notification.id}
              className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                !notification.isRead ? "bg-muted/30 border-l-4" : ""
              }`}
              style={
                !notification.isRead
                  ? {
                      borderLeftColor: `var(--${notification.severity.toLowerCase()}-color, currentColor)`,
                    }
                  : undefined
              }
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {!notification.isRead && (
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${severityColors.dot}`}
                      aria-label="Unread"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatRelativeTime(notification.createdAt)}</span>
                      {notification.resourceType && (
                        <span className="capitalize">
                          {notification.resourceType.toLowerCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${severityColors.bg} ${severityColors.text} ${severityColors.border} border font-medium`}
                >
                  {getSeverityLabel(notification.severity)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {isLoadingMore ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

NotificationsList.displayName = "NotificationsList";

export default NotificationsList;

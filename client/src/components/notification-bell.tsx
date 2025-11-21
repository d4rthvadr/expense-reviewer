"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Bell, AlertCircle, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  getNotifications,
  getUnreadNotificationCount,
  NotificationItem,
} from "@/actions/notification";
import { getSeverityColor, getSeverityLabel } from "@/constants/notifications";
import { formatRelativeTime } from "@/lib/time";

const POLLING_INTERVAL = 180000; // 3 minutes
const DEFAULT_LIMIT = 10;

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    const response = await getUnreadNotificationCount();
    if (response.success && response.count !== undefined) {
      setUnreadCount(response.count);
    } else {
      if (notifications.length > 0) {
        const unread = notifications.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }
    }
  }, [notifications]);

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

  // Initial fetch and polling setup
  useEffect(() => {
    fetchUnreadCount();

    const intervalId = setInterval(fetchUnreadCount, POLLING_INTERVAL);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUnreadCount();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications, notifications.length]);

  const handleLoadMore = () => {
    if (notifications.length > 0 && !isLoadingMore) {
      const lastNotification = notifications[notifications.length - 1];
      fetchNotifications(lastNotification.id);
    }
  };

  const handleRetry = () => {
    fetchNotifications();
  };

  const displayCount = unreadCount > 9 ? "9+" : unreadCount.toString();

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1"
              aria-live="polite"
              aria-label={`${unreadCount} unread notifications`}
            >
              {displayCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[32rem] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="overflow-y-auto max-h-[28rem]" role="list">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading...
              </span>
            </div>
          ) : error ? (
            <div
              className="flex items-start gap-2 px-4 py-3 text-sm border-b bg-red-50 dark:bg-red-950"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-red-700 dark:text-red-300">{error}</p>
                <button
                  onClick={handleRetry}
                  className="text-red-600 dark:text-red-400 underline hover:no-underline mt-1"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                We&apos;ll notify you when something important happens
              </p>
            </div>
          ) : (
            <>
              {notifications.map((notification) => {
                const severityColors = getSeverityColor(notification.severity);
                return (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b hover:bg-muted/50 transition-colors ${
                      !notification.isRead ? "bg-muted/30" : ""
                    }`}
                    role="listitem"
                  >
                    <div className="flex items-start gap-3">
                      {!notification.isRead && (
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${severityColors.dot}`}
                          aria-label="Unread"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-medium line-clamp-2">
                            {notification.title}
                          </h4>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${severityColors.bg} ${severityColors.text} ${severityColors.border} border`}
                          >
                            {getSeverityLabel(notification.severity)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                          {notification.message}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {hasMore && (
                <div className="px-4 py-3 border-t">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="w-full text-sm text-center text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      "Load more"
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

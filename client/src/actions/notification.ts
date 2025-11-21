"use server";

import { clientErrorHandler, getAuthenticatedClient } from "@/data/client";

export type NotificationType =
  | "CATEGORY_THRESHOLD"
  | "BUDGET_EXCEEDED"
  | "TRANSACTION_FLAGGED"
  | "REVIEW_REQUIRED"
  | "SYSTEM";

export type NotificationSeverity = "INFO" | "WARNING" | "CRITICAL";

export type NotificationResourceType =
  | "CATEGORY"
  | "TRANSACTION"
  | "BUDGET"
  | "REVIEW"
  | "SYSTEM";

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  severity: NotificationSeverity;
  resourceType: NotificationResourceType;
  resourceId: string;
  title: string;
  message: string;
  meta?: Record<string, unknown> | null;
  isRead: boolean;
  dedupeKey?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFilters {
  unreadOnly?: boolean;
  limit?: number;
  cursor?: string;
  type?: NotificationType;
  severity?: NotificationSeverity;
  resourceType?: NotificationResourceType;
}

export interface NotificationResponse {
  success: boolean;
  data: NotificationItem[];
  error?: string;
  message?: string;
}

export interface UnreadCountResponse {
  success: boolean;
  count?: number;
  error?: string;
  message?: string;
}

/**
 * Fetches notifications for the authenticated user
 */
export async function getNotifications(
  filters: NotificationFilters = {}
): Promise<NotificationResponse> {
  try {
    const searchParams = new URLSearchParams();

    if (filters.unreadOnly !== undefined) {
      searchParams.set("unreadOnly", String(filters.unreadOnly));
    }
    if (filters.limit !== undefined) {
      searchParams.set("limit", String(filters.limit));
    }
    if (filters.cursor) {
      searchParams.set("cursor", filters.cursor);
    }
    if (filters.type) {
      searchParams.set("type", filters.type);
    }
    if (filters.severity) {
      searchParams.set("severity", filters.severity);
    }
    if (filters.resourceType) {
      searchParams.set("resourceType", filters.resourceType);
    }

    const client = await getAuthenticatedClient();
    const response = await client.get<NotificationItem[]>(
      `/notifications${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`
    );

    // Backend returns array directly
    if (Array.isArray(response)) {
      return {
        success: true,
        data: response,
      };
    }

    return {
      success: false,
      data: [],
      error: "Invalid response format",
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    const errorResult = clientErrorHandler(
      error,
      "Failed to fetch notifications"
    );
    return {
      data: [],
      ...errorResult,
    };
  }
}

/**
 * Fetches unread notification count for the authenticated user
 */
export async function getUnreadNotificationCount(): Promise<UnreadCountResponse> {
  try {
    const client = await getAuthenticatedClient();
    const response = await client.get<{ count: number }>(
      "/notifications/unread-count"
    );

    return {
      success: true,
      count: response.count,
    };
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    const errorResult = clientErrorHandler(
      error,
      "Failed to fetch unread count"
    );
    return {
      ...errorResult,
    };
  }
}

/**
 * Mark a notification as read (for future use)
 */
export async function acknowledgeNotification(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await getAuthenticatedClient();
    await client.post(`/notifications/${notificationId}/acknowledge`, {});

    return { success: true };
  } catch (error) {
    console.error("Error acknowledging notification:", error);
    const errorResult = clientErrorHandler(
      error,
      "Failed to acknowledge notification"
    );
    return {
      ...errorResult,
    };
  }
}

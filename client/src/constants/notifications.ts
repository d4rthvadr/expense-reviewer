import { NotificationSeverity } from "@/actions/notification";

const NOTIFICATION_SEVERITY_COLORS = {
  INFO: {
    bg: "bg-blue-50 dark:bg-blue-950",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500",
  },
  WARNING: {
    bg: "bg-yellow-50 dark:bg-yellow-950",
    text: "text-yellow-700 dark:text-yellow-300",
    border: "border-yellow-200 dark:border-yellow-800",
    dot: "bg-yellow-500",
  },
  CRITICAL: {
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800",
    dot: "bg-red-500",
  },
} as const;

export function getSeverityColor(severity: NotificationSeverity) {
  return NOTIFICATION_SEVERITY_COLORS[severity];
}

export function getSeverityLabel(severity: NotificationSeverity): string {
  const labels = {
    INFO: "Info",
    WARNING: "Warning",
    CRITICAL: "Critical",
  };
  return labels[severity];
}

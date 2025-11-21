const MILLISECONDS_PER_MINUTE = 60000;
const MILLISECONDS_PER_HOUR = 3600000;
const MILLISECONDS_PER_DAY = 86400000;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_PER_WEEK = 7;
const DAYS_PER_MONTH = 30;
const DAYS_PER_YEAR = 365;

/**
 * Formats a date string into a human-readable relative time format.
 *
 * @param dateString - The date string to format (should be a valid date string that can be parsed by the Date constructor)
 * @returns A string representing the relative time difference between the given date and now
 *
 * @example
 * ```ts
 * formatRelativeTime("2024-01-15T10:30:00Z") // "2h ago"
 * formatRelativeTime("2024-01-14T10:30:00Z") // "1d ago"
 * ```
 *
 * @remarks
 * The function returns different formats based on the time difference:
 * - Less than 1 minute: "Just now"
 * - Less than 60 minutes: "{minutes}m ago"
 * - Less than 24 hours: "{hours}h ago"
 * - Less than 7 days: "{days}d ago"
 * - Less than 30 days: "{weeks}w ago"
 * - Less than 365 days: "{months}mo ago"
 * - 365 days or more: "{years}y ago"
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / MILLISECONDS_PER_MINUTE);
  const diffHours = Math.floor(diffMs / MILLISECONDS_PER_HOUR);
  const diffDays = Math.floor(diffMs / MILLISECONDS_PER_DAY);

  if (diffMins < 1) return "Just now";
  if (diffMins < MINUTES_PER_HOUR) return `${diffMins}m ago`;
  if (diffHours < HOURS_PER_DAY) return `${diffHours}h ago`;
  if (diffDays < DAYS_PER_WEEK) return `${diffDays}d ago`;
  if (diffDays < DAYS_PER_MONTH)
    return `${Math.floor(diffDays / DAYS_PER_WEEK)}w ago`;
  if (diffDays < DAYS_PER_YEAR)
    return `${Math.floor(diffDays / DAYS_PER_MONTH)}mo ago`;
  return `${Math.floor(diffDays / DAYS_PER_YEAR)}y ago`;
}

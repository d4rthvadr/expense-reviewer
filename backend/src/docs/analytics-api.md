# Analytics API Documentation

## Overview

The Analytics API provides endpoints to retrieve expense data aggregated over time periods.

## Endpoints

### GET /api/analytics/expenses-over-time

Retrieves expense totals and counts grouped by time periods.

#### Query Parameters

| Parameter  | Type   | Required | Description                              |
| ---------- | ------ | -------- | ---------------------------------------- |
| `dateFrom` | string | Yes      | Start date in ISO format (YYYY-MM-DD)    |
| `dateTo`   | string | Yes      | End date in ISO format (YYYY-MM-DD)      |
| `groupBy`  | string | Yes      | Time grouping: 'day', 'week', or 'month' |
| `userId`   | string | No       | Filter by specific user ID               |

#### Response Format

```json
{
  "success": true,
  "data": [
    {
      "period": "2024-01-01",
      "totalAmount": 150.5,
      "expenseCount": 5
    },
    {
      "period": "2024-01-02",
      "totalAmount": 200.75,
      "expenseCount": 3
    }
  ],
  "message": "Analytics data retrieved for 2 periods"
}
```

#### Example Requests

**Daily expenses for January 2024:**

```
GET /api/analytics/expenses-over-time?dateFrom=2024-01-01&dateTo=2024-01-31&groupBy=day
```

**Monthly expenses for 2024:**

```
GET /api/analytics/expenses-over-time?dateFrom=2024-01-01&dateTo=2024-12-31&groupBy=month
```

**Weekly expenses for a specific user:**

```
GET /api/analytics/expenses-over-time?dateFrom=2024-01-01&dateTo=2024-01-31&groupBy=week&userId=user123
```

#### Error Responses

**400 Bad Request - Missing Parameters:**

```json
{
  "success": false,
  "message": "Missing required parameters: dateFrom, dateTo, and groupBy are required"
}
```

**400 Bad Request - Invalid groupBy:**

```json
{
  "success": false,
  "message": "groupBy must be one of: day, week, month"
}
```

**400 Bad Request - Invalid Date:**

```json
{
  "success": false,
  "message": "Invalid date format. Please use ISO date strings."
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "message": "Internal server error while retrieving analytics data"
}
```

## Period Format

The `period` field in the response varies based on `groupBy`:

- **day**: `YYYY-MM-DD` (e.g., "2024-01-15")
- **week**: `YYYY-WNN` (e.g., "2024-W03" for week 3)
- **month**: `YYYY-MM` (e.g., "2024-01")

## Implementation Details

- All timestamps are converted to the beginning/end of the day for accurate querying
- Data is sorted chronologically by period
- Empty periods are not included in results
- All amounts are returned as numbers with decimal precision
- Expense counts represent the number of individual expenses in each period

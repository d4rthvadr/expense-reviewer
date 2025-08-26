export interface AnalyticsRequestDto {
  dateFrom: string; // ISO date string
  dateTo: string; // ISO date string
  groupBy: 'day' | 'week' | 'month';
  transactionType?: 'EXPENSE' | 'INCOME'; // Optional filter for transaction type
}

export interface AnalyticsResponseDto {
  period: string;
  totalAmount: number;
  transactionCount: number;
}

export interface AnalyticsApiResponse {
  success: boolean;
  data: AnalyticsResponseDto[];
  message?: string;
}

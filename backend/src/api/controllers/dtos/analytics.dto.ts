export interface AnalyticsRequestDto {
  dateFrom: string; // ISO date string
  dateTo: string; // ISO date string
  groupBy: 'day' | 'week' | 'month';
}

export interface AnalyticsResponseDto {
  period: string;
  totalAmount: number;
  expenseCount: number;
}

export interface AnalyticsApiResponse {
  success: boolean;
  data: AnalyticsResponseDto[];
  message?: string;
}

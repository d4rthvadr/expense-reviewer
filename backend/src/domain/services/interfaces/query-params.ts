export interface QueryParams {
  filters: Record<string, unknown>;
  sort: {
    sortBy: string;
    sortDir: string;
  };
  offset: number;
  limit: number;
}

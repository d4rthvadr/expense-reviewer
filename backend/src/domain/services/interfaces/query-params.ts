export interface QueryParams<T = object> {
  filters: T;
  sort: {
    sortBy: string;
    sortDir: string;
  };
  offset: number;
  limit: number;
}

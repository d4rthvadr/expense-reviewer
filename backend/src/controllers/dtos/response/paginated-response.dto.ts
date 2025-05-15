export type PaginatedResultDto<T> = {
  data: T[];
  total: number;
  limit: number;
  offset: number;
};

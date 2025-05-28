type SortDir = 'desc' | 'asc';

export type PaginatedInputDto<Filters = object> = {
  filters: Filters;
  sortDir?: SortDir;
  sortBy?: string;
  limit: number;
  offset: number;
};

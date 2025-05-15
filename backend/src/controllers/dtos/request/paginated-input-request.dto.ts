type SortDir = 'desc' | 'asc';

export type PaginatedInputDto<Filters = {}> = {
  filters: Filters;
  sortDir?: SortDir;
  sortBy?: string;
  limit: number;
  offset: number;
};

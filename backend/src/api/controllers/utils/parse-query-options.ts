import { PaginatedInputDto } from '@api/controllers/dtos/request/paginated-input-request.dto';
import { Request } from 'express';

export type RequestQueryType<T> = Request<unknown, unknown, unknown, T>;

export interface FindFilters {
  expenseId?: string;
  type?: string;
  category?: string;
  createdAt?: string;
}

const toNumberOrDefault = <T>(value: T, defaultValue: number): number => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

export const parseQueryOptions = (
  req: RequestQueryType<PaginatedInputDto<FindFilters>>
) => {
  const {
    sortBy = 'createdAt',
    sortDir = 'desc',
    limit,
    offset,
    ...filters
  } = req.query;

  return {
    sort: { sortBy, sortDir },
    offset: toNumberOrDefault(offset, 0),
    limit: toNumberOrDefault(limit, 10),
    filters,
  };
};

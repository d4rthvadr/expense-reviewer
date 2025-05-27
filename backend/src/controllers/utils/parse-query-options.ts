import { PaginatedInputDto } from '@controllers/dtos/request/paginated-input-request.dto';
import { Request } from 'express';

export type RequestQueryType<T> = Request<unknown, unknown, unknown, T>;

export interface FindFilters {
  expenseId?: string;
  type?: string;
  category?: string;
  createdAt?: string;
}

export const parseQueryOptions = (
  req: RequestQueryType<PaginatedInputDto<FindFilters>>
) => {
  const {
    sortBy = 'createdAt',
    sortDir = 'desc',
    offset = 0,
    limit = 10,
    ...filters
  } = req.query;

  return { sort: { sortBy, sortDir }, offset, limit, filters };
};

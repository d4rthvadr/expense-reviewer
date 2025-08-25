import { PaginatedInputDto } from '@api/controllers/dtos/request/paginated-input-request.dto';
import { QueryParams } from '@domain/services/interfaces/query-params';
import { Request } from 'express';

export type RequestQueryType<T> = Request<unknown, unknown, unknown, T>;

export interface FindFilters {
  expenseId?: string;
  type?: string;
  category?: string;
  createdAt?: string;
}

const toNumberOrDefault = <T>(value: T, defaultValue: number): number => {
  const num = Number(value as string);
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

export function parseQueryParams<T = object>(
  req: Request,
  getFilters?: (req: Request) => T
): QueryParams<T> {
  const page = toNumberOrDefault(req.query.page, 1);

  const limit = toNumberOrDefault(req.query.limit, 10);
  const sortBy = req.query.sortBy ? String(req.query.sortBy) : 'createdAt';
  const sortDir = req.query.sortDir ? String(req.query.sortDir) : 'desc';
  const offset = Math.ceil(page - 1) * Number(limit);

  let filters: T = {} as T;
  if (getFilters) {
    filters = getFilters(req);
  }

  return {
    limit,
    offset,
    sort: {
      sortBy,
      sortDir,
    },
    filters,
  };
}

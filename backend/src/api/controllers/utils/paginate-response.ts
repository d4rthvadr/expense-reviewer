import { PaginatedResultDto } from '../dtos/response/paginated-response.dto';

export const paginateDataResult = <T>(
  data: T[],
  total: number,
  limit: number,
  offset: number
): PaginatedResultDto<T> => {
  return {
    data,
    total,
    limit,
    page: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil(total / limit),
    hasNext: offset + limit < total,
    hasPrevious: offset > 0,
  };
};

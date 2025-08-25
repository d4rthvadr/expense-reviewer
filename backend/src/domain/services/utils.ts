import { QueryParams } from './interfaces/query-params';

export const buildFindQuery = ({
  filters,
  limit = 10,
  offset = 0,
}: {
  filters: QueryParams['filters'];
  limit?: number;
  offset?: number;
}): Omit<QueryParams, 'page'> => {
  return {
    filters,
    sort: {
      sortBy: 'createdAt',
      sortDir: 'desc',
    },
    limit,
    offset,
  };
};

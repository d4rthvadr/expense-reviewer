import { QueryParams } from './interfaces/query-params';

export const buildFindQuery = ({
  filters,
  limit = 10,
  offset = 0,
}: {
  filters: QueryParams['filters'];
  limit?: number;
  offset?: number;
}): QueryParams => {
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

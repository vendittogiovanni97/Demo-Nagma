import { IPaginatedResponse } from './interfaces';

export type PaginatedResponse<T> = IPaginatedResponse<T>;
export type CustomPaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function paginate<T>(data: T[], total: number, page: number = 1, limit: number = 25): IPaginatedResponse<T> {
  const calcPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));
  return {
    data,
    total,
    page: Math.max(1, page),
    limit: Math.max(1, limit),
    pages: calcPages,
    totalPages: calcPages,
  };
}

export function buildPagination(page: number, limit: number) {
  return { skip: (page - 1) * limit, take: limit };
}

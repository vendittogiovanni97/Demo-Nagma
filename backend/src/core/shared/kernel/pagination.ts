import { IPaginatedResponse } from './interfaces';

export type PaginatedResponse<T> = IPaginatedResponse<T>;
export type CustomPaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function paginate<T>(data: T[], total: number, page: number, limit: number): IPaginatedResponse<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export function buildPagination(page: number, limit: number) {
  return { skip: (page - 1) * limit, take: limit };
}

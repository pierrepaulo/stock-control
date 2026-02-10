export interface ApiResponse<T> {
  error: string | null;
  data: T | null;
}

export interface PaginationParams {
  offset?: number;
  limit?: number;
}

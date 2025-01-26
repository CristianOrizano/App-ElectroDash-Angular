export interface PaginatedResponse<t> {
  content: t[];
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalElements: number;
}

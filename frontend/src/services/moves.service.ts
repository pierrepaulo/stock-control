import apiClient from "@/lib/api-client";
import type { PaginationParams } from "@/types/api";
import type { CreateMoveInput, Move } from "@/types/move";

export interface ListMovesParams extends PaginationParams {
  productId?: string;
}

export const movesService = {
  list: (params?: ListMovesParams) =>
    apiClient.get<Move[], Move[]>("/moves", { params }),

  create: (data: CreateMoveInput) => apiClient.post<Move, Move>("/moves", data),
};

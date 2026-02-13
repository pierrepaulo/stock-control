"use client";

import { movesService, type ListMovesParams } from "@/services/moves.service";
import type { CreateMoveInput } from "@/types/move";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const moveQueryKeys = {
  all: ["moves"] as const,
  list: (params: ListMovesParams) => ["moves", "list", params] as const,
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const useMoves = (params: ListMovesParams) =>
  useQuery({
    queryKey: moveQueryKeys.list(params),
    queryFn: () => movesService.list(params),
    placeholderData: (previousData) => previousData,
  });

export const useCreateMove = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMoveInput) => movesService.create(data),
    onSuccess: () => {
      toast.success("Movimentacao registrada com sucesso.");
      void queryClient.invalidateQueries({ queryKey: ["moves"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Nao foi possivel registrar a movimentacao.")
      );
    },
  });
};

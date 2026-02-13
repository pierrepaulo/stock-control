"use client";

import { usersService, type ListUsersParams } from "@/services/users.service";
import type { CreateUserInput, UpdateUserInput } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const userQueryKeys = {
  all: ["users"] as const,
  list: (params: ListUsersParams) => ["users", "list", params] as const,
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const useUsers = (params: ListUsersParams) =>
  useQuery({
    queryKey: userQueryKeys.list(params),
    queryFn: () => usersService.list(params),
    placeholderData: (previousData) => previousData,
  });

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserInput) => usersService.create(data),
    onSuccess: () => {
      toast.success("Usuario criado com sucesso.");
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Nao foi possivel criar o usuario."));
    },
  });
};

interface UpdateUserMutationInput {
  id: string;
  data: UpdateUserInput;
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateUserMutationInput) =>
      usersService.update(id, data),
    onSuccess: () => {
      toast.success("Usuario atualizado com sucesso.");
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Nao foi possivel atualizar o usuario."));
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      toast.success("Usuario excluido com sucesso.");
      void queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Nao foi possivel excluir o usuario."));
    },
  });
};


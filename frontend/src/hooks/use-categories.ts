"use client";

import { categoriesService } from "@/services/categories.service";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/types/category";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const categoryQueryKeys = {
  all: ["categories"] as const,
  list: ["categories", "list"] as const,
  withProductCount: ["categories", "with-product-count"] as const,
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const useCategories = () =>
  useQuery({
    queryKey: categoryQueryKeys.list,
    queryFn: () => categoriesService.listSimple(),
  });

export const useCategoriesWithProductCount = () =>
  useQuery({
    queryKey: categoryQueryKeys.withProductCount,
    queryFn: () => categoriesService.listWithProductCount(),
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryInput) => categoriesService.create(data),
    onSuccess: () => {
      toast.success("Categoria criada com sucesso.");
      void queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Nao foi possivel criar a categoria."));
    },
  });
};

interface UpdateCategoryMutationInput {
  id: string;
  data: UpdateCategoryInput;
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateCategoryMutationInput) =>
      categoriesService.update(id, data),
    onSuccess: () => {
      toast.success("Categoria atualizada com sucesso.");
      void queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Nao foi possivel atualizar a categoria.")
      );
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      toast.success("Categoria excluida com sucesso.");
      void queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(
          error,
          "Nao foi possivel excluir a categoria. Verifique se ela possui produtos vinculados."
        )
      );
    },
  });
};

"use client";

import { productsService, type ListProductsParams } from "@/services/products.service";
import type { CreateProductInput, UpdateProductInput } from "@/types/product";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const productQueryKeys = {
  all: ["products"] as const,
  list: (params: ListProductsParams) => ["products", "list", params] as const,
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const useProducts = (params: ListProductsParams) =>
  useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => productsService.list(params),
    placeholderData: (previousData) => previousData,
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductInput) => productsService.create(data),
    onSuccess: () => {
      toast.success("Produto criado com sucesso.");
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Nao foi possivel criar o produto."));
    },
  });
};

interface UpdateProductMutationInput {
  id: string;
  data: UpdateProductInput;
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateProductMutationInput) =>
      productsService.update(id, data),
    onSuccess: () => {
      toast.success("Produto atualizado com sucesso.");
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Nao foi possivel atualizar o produto."));
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsService.delete(id),
    onSuccess: () => {
      toast.success("Produto excluido com sucesso.");
      void queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Nao foi possivel excluir o produto."));
    },
  });
};

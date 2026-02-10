import apiClient from "@/lib/api-client";
import type { PaginationParams } from "@/types/api";
import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from "@/types/product";

export interface ListProductsParams extends PaginationParams {
  name?: string;
}

export const productsService = {
  list: (params?: ListProductsParams) =>
    apiClient.get<Product[]>("/products", { params }),

  getById: (id: string) => apiClient.get<Product>(`/products/${id}`),

  create: (data: CreateProductInput) =>
    apiClient.post<Product>("/products", data),

  update: (id: string, data: UpdateProductInput) =>
    apiClient.put<Product>(`/products/${id}`, data),

  delete: (id: string) => apiClient.delete<null>(`/products/${id}`),
};


import apiClient from "@/lib/api-client";
import type {
  Category,
  CategoryWithCount,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/types/category";

export interface ListCategoriesParams {
  includeProductCount?: boolean;
}

export const categoriesService = {
  list: (params?: ListCategoriesParams) =>
    apiClient.get<Category[] | CategoryWithCount[]>("/categories", { params }),

  getById: (id: string) => apiClient.get<Category>(`/categories/${id}`),

  create: (data: CreateCategoryInput) =>
    apiClient.post<Category>("/categories", data),

  update: (id: string, data: UpdateCategoryInput) =>
    apiClient.put<Category>(`/categories/${id}`, data),

  delete: (id: string) => apiClient.delete<null>(`/categories/${id}`),
};


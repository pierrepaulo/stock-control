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
    apiClient.get<Category[] | CategoryWithCount[], Category[] | CategoryWithCount[]>(
      "/categories",
      { params }
    ),

  listWithProductCount: () =>
    apiClient.get<CategoryWithCount[], CategoryWithCount[]>("/categories", {
      params: { includeProductCount: true },
    }),

  getById: (id: string) => apiClient.get<Category, Category>(`/categories/${id}`),

  create: (data: CreateCategoryInput) =>
    apiClient.post<Category, Category>("/categories", data),

  update: (id: string, data: UpdateCategoryInput) =>
    apiClient.put<Category, Category>(`/categories/${id}`, data),

  delete: (id: string) => apiClient.delete<null, null>(`/categories/${id}`),
};

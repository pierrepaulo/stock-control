import apiClient from "@/lib/api-client";
import type { PaginationParams } from "@/types/api";
import type { CreateUserInput, UpdateUserInput, User } from "@/types/user";

const buildUserUpdateFormData = (data: UpdateUserInput): FormData => {
  const formData = new FormData();

  if (data.name !== undefined) {
    formData.append("name", data.name);
  }

  if (data.email !== undefined) {
    formData.append("email", data.email);
  }

  if (data.password !== undefined && data.password.length > 0) {
    formData.append("password", data.password);
  }

  if (data.isAdmin !== undefined) {
    formData.append("isAdmin", String(data.isAdmin));
  }

  if (data.avatar instanceof File) {
    formData.append("avatar", data.avatar);
  }

  return formData;
};

export type ListUsersParams = PaginationParams;

export const usersService = {
  list: (params?: ListUsersParams) =>
    apiClient.get<User[], User[]>("/users", { params }),

  getById: (id: string) => apiClient.get<User, User>(`/users/${id}`),

  create: (data: CreateUserInput) =>
    apiClient.post<User, User>("/users", data),

  update: (id: string, data: UpdateUserInput) =>
    apiClient.put<User, User>(`/users/${id}`, buildUserUpdateFormData(data), {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  delete: (id: string) => apiClient.delete<null, null>(`/users/${id}`),
};

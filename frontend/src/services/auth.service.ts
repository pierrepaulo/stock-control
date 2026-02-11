import apiClient from "@/lib/api-client";
import type { AuthUser, LoginCredentials, LoginResponse } from "@/types/auth";

export interface LogoutResponse {
  message: string;
}

export const authService = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<LoginResponse, LoginResponse>("/auth/login", credentials),

  logout: () => apiClient.post<LogoutResponse, LogoutResponse>("/auth/logout"),

  getMe: () => apiClient.get<AuthUser, AuthUser>("/auth/me"),
};
